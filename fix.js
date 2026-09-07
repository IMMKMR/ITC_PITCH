const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<figcaption class="timeline-floating-card reveal">([\s\S]*?)<\/figcaption>\s*<\/figure>/g, '</figure>\n          <div class="timeline-floating-card reveal">$1</div>');
fs.writeFileSync('index.html', html);
console.log('HTML restructured successfully.');
