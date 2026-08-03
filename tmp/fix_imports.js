const fs = require('fs');
const path = require('path');
const { Project } = require('ts-morph');

const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'eslint_report_combined.json'), 'utf8'));

const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../tsconfig.base.json'),
  skipAddingFilesFromTsConfig: true
});

let importsRemoved = 0;
let filesModified = 0;

for (const file of report) {
  let unusedVarNames = [];
  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      const match = msg.message.match(/'([^']+)' is defined but never used/);
      if (match) unusedVarNames.push(match[1]);
    }
  }

  if (unusedVarNames.length > 0) {
    const filePath = file.filePath;
    if (!fs.existsSync(filePath)) continue;
    
    let sourceFile = project.getSourceFile(filePath);
    if (!sourceFile) {
      sourceFile = project.addSourceFileAtPath(filePath);
    }
    
    let modified = false;

    // Process unused imports
    const importDeclarations = sourceFile.getImportDeclarations();
    for (const importDecl of importDeclarations) {
      let declModified = false;

      // Handle Default Import
      const defaultImport = importDecl.getDefaultImport();
      if (defaultImport && unusedVarNames.includes(defaultImport.getText())) {
        importDecl.removeDefaultImport();
        declModified = true;
      }

      // Handle Namespace Import
      const namespaceImport = importDecl.getNamespaceImport();
      if (namespaceImport && unusedVarNames.includes(namespaceImport.getText())) {
        importDecl.removeNamespaceImport();
        declModified = true;
      }

      // Handle Named Imports
      const namedImports = importDecl.getNamedImports();
      for (const namedImport of namedImports) {
        // either alias or name
        const name = namedImport.getAliasNode() ? namedImport.getAliasNode().getText() : namedImport.getName();
        if (unusedVarNames.includes(name)) {
          namedImport.remove();
          declModified = true;
        }
      }

      // If we modified the import, check if it's now empty
      if (declModified) {
        modified = true;
        importsRemoved++;
        
        // If there are no default, namespace, or named imports, AND it's not a pure side-effect import
        // A pure side effect import doesn't have an import clause anyway.
        // But if it had an import clause that is now empty, it means we removed all specifiers.
        const clause = importDecl.getImportClause();
        if (clause) {
           const hasDefault = clause.getDefaultImport();
           const hasNamespace = clause.getNamespaceImport();
           const hasNamed = clause.getNamedBindings() && clause.getNamedBindings().getElements && clause.getNamedBindings().getElements().length > 0;
           
           if (!hasDefault && !hasNamespace && !hasNamed) {
             importDecl.remove();
           }
        }
      }
    }

    if (modified) {
      sourceFile.saveSync();
      filesModified++;
      console.log(`Updated imports in ${filePath}`);
    }
  }
}

console.log(`Removed ${importsRemoved} unused import specifiers across ${filesModified} files.`);
