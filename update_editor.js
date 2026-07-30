const fs = require('fs');
const file = 'apps/web/src/components/dashboard/b2b/B2BHomeEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add activeLang state
content = content.replace(
  'const [hero, setHero] = React.useState(initialData.content?.hero || {})',
  'const [activeLang, setActiveLang] = React.useState<\'en\' | \'ar\'>(\'en\')\n  const [hero, setHero] = React.useState(initialData.content?.hero || {})'
);

// 2. Add language switcher
const langSwitcher = `
        {/* LANGUAGE SWITCHER */}
        <div className="flex bg-surface-default p-1 rounded-md w-fit border border-border-default mb-4">
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            className={\`px-4 py-2 text-sm font-semibold rounded-sm transition-colors \${activeLang === 'en' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}\`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('ar')}
            className={\`px-4 py-2 text-sm font-semibold rounded-sm transition-colors \${activeLang === 'ar' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}\`}
          >
            العربية (Arabic)
          </button>
        </div>
`;
content = content.replace(
  '<div className="space-y-8">',
  '<div className="space-y-8">\n' + langSwitcher
);

// 3. Update Hero inputs
function replaceHeroInput(label, propEn, propAr) {
  // e.g. label="Headline" value={hero.title || ""} onChange={e => setHero({ ...hero, title: e.target.value })}
  // We need a robust string replace since regex can be finicky with all the symbols.
  const oldLine1 = `label="${label}" \n                value={hero.${propEn} || ""} \n                onChange={e => setHero({ ...hero, ${propEn}: e.target.value })}`;
  const oldLine2 = `label="${label}" value={hero.${propEn} || ""} onChange={e => setHero({ ...hero, ${propEn}: e.target.value })}`;
  
  // Try regex since spacing varies
  const regex = new RegExp(\`label="\\$\\{label\\}"\\\\s*value=\\\\\\{hero\\\\.\\$\\{propEn\\} \\\\|\\\\| ""\\\\\\\\}\\\\s*onChange=\\\\\\{e => setHero\\\\(\\\\\\{ \\\\.\\\\.\\\\.hero, \\$\\{propEn\\}: e\\\\.target\\\\.value \\\\\\}\\\\)\\\\}\`);
  const replacement = \`label="\${label}" value={activeLang === 'en' ? (hero.\${propEn} || "") : (hero.\${propAr} || "")} onChange={e => setHero({ ...hero, [activeLang === 'en' ? '\${propEn}' : '\${propAr}']: e.target.value })}\`;
  
  content = content.replace(regex, replacement);
}

replaceHeroInput("Headline", "title", "titleAr");
replaceHeroInput("Subtitle", "subtitle", "subtitleAr");
replaceHeroInput("Description", "description", "descriptionAr");
replaceHeroInput("Primary CTA Label", "primaryCta", "primaryCtaAr");
replaceHeroInput("Secondary CTA Label", "secondaryCta", "secondaryCtaAr");

// 4. Update Stats
content = content.replace(
  /value=\{stat\.value\}[\s\S]*?newStats\[idx\]\.value = e\.target\.value/,
  \`value={activeLang === 'en' ? (stat.value || "") : (stat.valueAr || stat.value || "")} \n                    onChange={e => {\n                      const newStats = [...stats]\n                      newStats[idx][activeLang === 'en' ? 'value' : 'valueAr'] = e.target.value\`
);

content = content.replace(
  /value=\{stat\.label\}[\s\S]*?newStats\[idx\]\.label = e\.target\.value/,
  \`value={activeLang === 'en' ? (stat.label || "") : (stat.labelAr || stat.label || "")} \n                    onChange={e => {\n                      const newStats = [...stats]\n                      newStats[idx][activeLang === 'en' ? 'label' : 'labelAr'] = e.target.value\`
);

// 5. Update WowAndHow inputs
function replaceWowAndHowInput(label, propEn, propAr) {
  const regex = new RegExp(\`label="\\$\\{label\\}"\\\\s*value=\\\\\\{wowAndHow\\\\.\\$\\{propEn\\} \\\\|\\\\| ""\\\\\\\\}\\\\s*onChange=\\\\\\{e => setWowAndHow\\\\(\\\\\\{ \\\\.\\\\.\\\\.wowAndHow, \\$\\{propEn\\}: e\\\\.target\\\\.value \\\\\\}\\\\)\\\\}\`);
  const replacement = \`label="\${label}" value={activeLang === 'en' ? (wowAndHow.\${propEn} || "") : (wowAndHow.\${propAr} || "")} onChange={e => setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? '\${propEn}' : '\${propAr}']: e.target.value })}\`;
  content = content.replace(regex, replacement);
}

replaceWowAndHowInput("Section Title", "title", "titleAr");
replaceWowAndHowInput("Section Description", "description", "descriptionAr");


// Bullets - let's just do simple text replacements for the arrays
// WOW Bullets array mapping
content = content.replace(
  /\{\(wowAndHow\.wowBullets \|\| \[\]\)\.map/g,
  \`{(activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])).map\`
);

// WOW Bullets Add button
content = content.replace(
  /setWowAndHow\(\{ \.\.\.wowAndHow, wowBullets: \[\.\.\.\(wowAndHow\.wowBullets \|\| \[\]\), ''\] \}\)/g,
  \`setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: [...(activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])), ''] })\`
);

// WOW Bullets Edit
content = content.replace(
  /const newBullets = \[\.\.\.\(wowAndHow\.wowBullets \|\| \[\]\)\]\s*newBullets\[idx\] = e\.target\.value\s*setWowAndHow\(\{ \.\.\.wowAndHow, wowBullets: newBullets \}\)/g,
  \`const newBullets = [...(activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || []))]\n                      newBullets[idx] = e.target.value\n                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: newBullets })\`
);

// WOW Bullets Delete
content = content.replace(
  /const newBullets = \[\.\.\.\(wowAndHow\.wowBullets \|\| \[\]\)\]\s*newBullets\.splice\(idx, 1\)\s*setWowAndHow\(\{ \.\.\.wowAndHow, wowBullets: newBullets \}\)/g,
  \`const newBullets = [...(activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || []))]\n                      newBullets.splice(idx, 1)\n                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: newBullets })\`
);

// HOW Bullets array mapping
content = content.replace(
  /\{\(wowAndHow\.howBullets \|\| \[\]\)\.map/g,
  \`{(activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])).map\`
);

// HOW Bullets Add button
content = content.replace(
  /setWowAndHow\(\{ \.\.\.wowAndHow, howBullets: \[\.\.\.\(wowAndHow\.howBullets \|\| \[\]\), ''\] \}\)/g,
  \`setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: [...(activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])), ''] })\`
);

// HOW Bullets Edit
content = content.replace(
  /const newBullets = \[\.\.\.\(wowAndHow\.howBullets \|\| \[\]\)\]\s*newBullets\[idx\] = e\.target\.value\s*setWowAndHow\(\{ \.\.\.wowAndHow, howBullets: newBullets \}\)/g,
  \`const newBullets = [...(activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || []))]\n                      newBullets[idx] = e.target.value\n                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: newBullets })\`
);

// HOW Bullets Delete
content = content.replace(
  /const newBullets = \[\.\.\.\(wowAndHow\.howBullets \|\| \[\]\)\]\s*newBullets\.splice\(idx, 1\)\s*setWowAndHow\(\{ \.\.\.wowAndHow, howBullets: newBullets \}\)/g,
  \`const newBullets = [...(activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || []))]\n                      newBullets.splice(idx, 1)\n                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: newBullets })\`
);


fs.writeFileSync(file, content);
console.log("Updated B2BHomeEditor.tsx successfully");
