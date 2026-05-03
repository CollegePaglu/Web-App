const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./app', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace color: '#fff' when background is var(--cp-primary)
    content = content.replace(/background:\s*["']var\(--cp-primary\)["'],\s*color:\s*["']#fff["']/g, 'background: "var(--cp-primary)", color: "var(--cp-primary-text)"');
    
    // Replace where color is first
    content = content.replace(/color:\s*["']#fff["'],\s*background:\s*["']var\(--cp-primary\)["']/g, 'color: "var(--cp-primary-text)", background: "var(--cp-primary)"');

    // Remove gradient from login page
    if(filePath.includes('login') && filePath.includes('page.tsx')){
      content = content.replace(/linear-gradient\(145deg,\s*#1B9D6B,\s*#0F6D48\)/g, 'linear-gradient(145deg, #262626, #000000)');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated:', filePath);
    }
  }
});
