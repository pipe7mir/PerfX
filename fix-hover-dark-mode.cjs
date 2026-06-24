const fs = require('fs');
const path = require('path');
const dirs = ['src/pages', 'src/components'];
const ext = '.tsx';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(ext)) {
      results.push(file);
    }
  });
  return results;
}

let modifiedCount = 0;

dirs.forEach(dir => {
  const files = walk(dir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    content = content.replace(/className=(['"])(.*?)\1/g, (match, quote, classes) => {
      let newClasses = classes;
      
      // Fix hover backgrounds
      if (newClasses.match(/hover:bg-(white|slate-50|slate-100|navy-50)/) && !newClasses.includes('dark:hover:bg-')) {
        newClasses = newClasses.replace(/(hover:bg-(?:white|slate-50|slate-100|navy-50))(\/[0-9]+)?/g, '$1$2 dark:hover:bg-navy-700$2');
      }

      // Fix group-hover backgrounds
      if (newClasses.match(/group-hover:bg-(white|slate-50|slate-100|navy-50)/) && !newClasses.includes('dark:group-hover:bg-')) {
        newClasses = newClasses.replace(/(group-hover:bg-(?:white|slate-50|slate-100|navy-50))(\/[0-9]+)?/g, '$1$2 dark:group-hover:bg-navy-700$2');
      }

      // Fix hover text
      if (newClasses.match(/hover:text-(slate|navy|gray)-(700|800|900)/) && !newClasses.includes('dark:hover:text-')) {
        newClasses = newClasses.replace(/(hover:text-(?:slate|navy|gray)-(?:700|800|900))/g, '$1 dark:hover:text-white');
      }
      
      // Fix group-hover text
      if (newClasses.match(/group-hover:text-(slate|navy|gray)-(700|800|900)/) && !newClasses.includes('dark:group-hover:text-')) {
        newClasses = newClasses.replace(/(group-hover:text-(?:slate|navy|gray)-(?:700|800|900))/g, '$1 dark:group-hover:text-white');
      }

      if (newClasses !== classes) {
        return `className=${quote}${newClasses}${quote}`;
      }
      return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      modifiedCount++;
      console.log(`Updated hover states in ${file}`);
    }
  });
});

console.log(`Fixed hover states in ${modifiedCount} files.`);
