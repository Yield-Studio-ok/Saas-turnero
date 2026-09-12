const fs = require('fs');

// businesses.controller.ts
let c1 = fs.readFileSync('src/modules/businesses/businesses.controller.ts', 'utf8');
c1 = c1.replace(
  /create\(@Req\(\) req: Request, @Body\(\) createBusinessDto: CreateBusinessDto\) \{[\s\S]*?return this\.businessesService\.create\(user\.uid, createBusinessDto\);\s*\}/,
  'create(@Req() req: Request, @Body() createBusinessDto: CreateBusinessDto) {\n' +
  '    const user = req.user as AuthUser;\n' +
  '    return this.businessesService.create(user.uid, user.email, createBusinessDto);\n' +
  '  }'
);
fs.writeFileSync('src/modules/businesses/businesses.controller.ts', c1);

// businesses.service.ts
let c2 = fs.readFileSync('src/modules/businesses/businesses.service.ts', 'utf8');
c2 = c2.replace(
  /async create\(ownerId: string, createBusinessDto: CreateBusinessDto\) \{[\s\S]*?const business = await this\.prisma\.business\.create\(\{\s*data: \{\s*\.\.\.createBusinessDto,\s*ownerId,\s*\},\s*\}\);/,
  'async create(firebaseUid: string, email: string, createBusinessDto: CreateBusinessDto) {\n' +
  '    let user = await this.prisma.user.findUnique({ where: { firebaseUid } });\n' +
  '    if (!user) {\n' +
  '      user = await this.prisma.user.findUnique({ where: { email } });\n' +
  '      if (user) {\n' +
  '        user = await this.prisma.user.update({ where: { email }, data: { firebaseUid, role: \"owner\" } });\n' +
  '      } else {\n' +
  '        user = await this.prisma.user.create({ data: { firebaseUid, email, role: \"owner\" } });\n' +
  '      }\n' +
  '    }\n' +
  '    const business = await this.prisma.business.create({ data: { ...createBusinessDto, ownerId: user.id } });'
);
c2 = c2.replace(/await this\.firebase\.setRole\(ownerId, "owner", business\.id\);/g, 'await this.firebase.setRole(firebaseUid, \"owner\", business.id);');
c2 = c2.replace(/where: \{ id: ownerId \}/g, 'where: { id: user.id }');
fs.writeFileSync('src/modules/businesses/businesses.service.ts', c2);
