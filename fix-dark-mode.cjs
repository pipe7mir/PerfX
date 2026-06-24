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
    
    // Replace text-slate-700, 800, 900 and text-navy-700, 800, 900 with dark equivalents
    const originalContent = content;
    
    content = content.replace(/className=(['"])(.*?)\1/g, (match, quote, classes) => {
      let newClasses = classes;
      
      // Fix dark text
      if (newClasses.match(/text-(slate|navy|gray)-(700|800|900)/) && !newClasses.includes('dark:text-')) {
        newClasses = newClasses.replace(/(text-(slate|navy|gray)-(700|800|900))/g, '$1 dark:text-white');
      }
      
      // Fix dark backgrounds that might still be hardcoded white/slate-50
      if (newClasses.match(/bg-(white|slate-50|slate-100)/) && !newClasses.includes('dark:bg-')) {
        newClasses = newClasses.replace(/(bg-(white|slate-50|slate-100))/g, '$1 dark:bg-navy-800');
      }

      // Fix borders
      if (newClasses.match(/border-(slate|navy|gray)-(100|200)/) && !newClasses.includes('dark:border-')) {
        newClasses = newClasses.replace(/(border-(slate|navy|gray)-(100|200))/g, '$1 dark:border-white/10');
      }

      if (newClasses !== classes) {
        return `className=${quote}${newClasses}${quote}`;
      }
      return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      modifiedCount++;
      console.log(`Updated ${file}`);
    }
  });
});

console.log(`Modified ${modifiedCount} files for dark mode compatibility.`);
