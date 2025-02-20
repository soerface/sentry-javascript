import * as fs from 'fs';
import * as path from 'path';

type PackageJson = {
  main?: string;
  type?: string;
  nx?: string;
  volta?: any;
  exports?: Record<string, string | Record<string, string>>;
};

const buildDir = path.join(process.cwd(), 'build');
const pkjJsonPath = path.join(buildDir, 'package.json');
const pkgJson: PackageJson = JSON.parse(fs.readFileSync(pkjJsonPath).toString());

// This is necessary for Angular 17+ compatibility when SSR is configured which switches dev mode to using Vite.
// Deleting "main" and adding "type": "module" will direct Vite to
// use the fesm2015 bundle instead of the UMD bundle.
delete pkgJson.main;
pkgJson.type = 'module';

pkgJson.exports = {
  '.': {
    es2015: './fesm2015/sentry-angular-ivy.js',
    esm2015: './esm2015/sentry-angular-ivy.js',
    fesm2015: './fesm2015/sentry-angular-ivy.js',
    import: './fesm2015/sentry-angular-ivy.js',
    require: './bundles/sentry-angular-ivy.umd.js',
    types: './sentry-angular-ivy.d.ts',
  },
  './*': './*',
};

// no need to keep around other properties that are only relevant for our reop:
delete pkgJson.nx;
delete pkgJson.volta;

fs.writeFileSync(pkjJsonPath, JSON.stringify(pkgJson, null, 2));

console.log('Adjusted package.json for Angular 17+ compatibility.');
