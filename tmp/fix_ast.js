const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'eslint_report_combined.json'), 'utf8'));

const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../tsconfig.base.json'),
  skipAddingFilesFromTsConfig: true
});

let fixes = 0;

for (const file of report) {
  let unusedVarNames = [];
  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      const match = msg.message.match(/'([^']+)' is (?:defined|assigned a value) but never used/);
      if (match) unusedVarNames.push(match[1]);
    }
  }

  if (unusedVarNames.length > 0) {
    const filePath = file.filePath;
    if (!fs.existsSync(filePath)) continue;
    
    let sourceFile = project.getSourceFile(filePath) || project.addSourceFileAtPath(filePath);
    let modified = false;

    // 1. Catch Clauses
    sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause).forEach(catchClause => {
      const varDecl = catchClause.getVariableDeclaration();
      if (varDecl) {
        const name = varDecl.getName();
        if (unusedVarNames.includes(name)) {
          // Remove the variable declaration (making it just catch { })
          catchClause.getVariableDeclaration().remove();
          modified = true;
          fixes++;
        }
      }
    });

    // 2. Object Binding Elements (e.g. const { isRTL, locale } = ...)
    sourceFile.getDescendantsOfKind(SyntaxKind.BindingElement).forEach(bindingElem => {
      // The name of the property being destructured
      const nameNode = bindingElem.getNameNode();
      if (nameNode && nameNode.getKind() === SyntaxKind.Identifier) {
        const name = nameNode.getText();
        if (unusedVarNames.includes(name)) {
          // If it's the rest element, we can just remove it
          if (bindingElem.getDotDotDotToken()) {
            bindingElem.remove();
            modified = true;
            fixes++;
          } else {
            // It's a named element. We can remove it.
            // But wait, if we are in function params, we should rename it to _name or remove it if possible.
            // Let's just remove it if it's in a variable declaration (not a parameter)
            const parent = bindingElem.getParent();
            if (parent.getKind() === SyntaxKind.ObjectBindingPattern) {
              const grandParent = parent.getParent();
              if (grandParent.getKind() === SyntaxKind.VariableDeclaration) {
                bindingElem.remove();
                modified = true;
                fixes++;
              }
            }
          }
        }
      }
    });

    // 3. Array Binding Elements (e.g. const [state, setState] = ...)
    sourceFile.getDescendantsOfKind(SyntaxKind.ArrayBindingPattern).forEach(arrayPattern => {
      const elements = arrayPattern.getElements();
      elements.forEach((elem, index) => {
        if (elem.getKind() === SyntaxKind.BindingElement) {
          const name = elem.getName();
          if (unusedVarNames.includes(name)) {
            // To omit an element in array destructuring, we can't just remove it if there are elements after it.
            // We just rename it to _name, or if we can replace it with an OmittedExpression...
            // Let's just rename it to `_${name}` to satisfy unused var ignores (if config allows) or just use empty if it's not the last.
            // Actually, replacing with OmittedExpression is safer.
            // In ts-morph, you can remove a binding element and it leaves the comma if needed?
            // Let's try removing it. ts-morph handles the commas.
            // Wait, if it's `[loading, setLoading]`, removing `loading` makes it `[, setLoading]`.
            elem.remove();
            modified = true;
            fixes++;
          }
        }
      });
    });

    // 4. Regular Variable Declarations (e.g. const foo = ...)
    sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach(varDecl => {
      const nameNode = varDecl.getNameNode();
      if (nameNode.getKind() === SyntaxKind.Identifier) {
        const name = nameNode.getText();
        if (unusedVarNames.includes(name)) {
          const parent = varDecl.getParent();
          if (parent.getKind() === SyntaxKind.VariableDeclarationList) {
             const decls = parent.getDeclarations();
             if (decls.length === 1) {
                // If it's the only one, remove the whole statement
                const stmt = parent.getParent();
                // If it's a VariableStatement, remove it. 
                // But wait, if it has a side-effect (e.g. await foo()), we should leave the initializer!
                const initializer = varDecl.getInitializer();
                if (initializer && initializer.getKind() === SyntaxKind.AwaitExpression) {
                   stmt.replaceWithText(initializer.getText() + ';');
                } else {
                   stmt.remove();
                }
             } else {
                varDecl.remove();
             }
             modified = true;
             fixes++;
          }
        }
      }
    });

    if (modified) {
      sourceFile.saveSync();
      console.log(`Updated AST for ${filePath}`);
    }
  }
}

console.log(`Auto-fixed ${fixes} variables via AST`);
