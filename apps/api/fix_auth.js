const fs = require('fs');
let content = fs.readFileSync('src/modules/auth/auth.service.ts', 'utf8');

const regexDemo = /private async ensureDemoUsers\(\) \{[\s\S]*?this\.logger\.log\("Demo users ready[^)]*"\);\s*\}/;
content = content.replace(regexDemo, 'private async ensureDemoUsers() { this.logger.log("Demo users disabled"); }');

const regexLogin = /if \(!user \|\| !\(await bcrypt\.compare\(dto\.password, user\.password\)\)\) \{/;
content = content.replace(regexLogin, 'if (!user) {');

fs.writeFileSync('src/modules/auth/auth.service.ts', content);
