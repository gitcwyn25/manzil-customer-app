import fs from "node:fs";
import path from "node:path";

const serverFuncPkg = path.resolve(".vercel/output/functions/__server.func/package.json");
const targetNodeModules = path.resolve(".vercel/output/functions/__server.func/node_modules");

if (fs.existsSync(serverFuncPkg)) {
  const pkg = JSON.parse(fs.readFileSync(serverFuncPkg, "utf8"));
  const deps = Object.keys(pkg.dependencies || {});

  if (deps.length > 0) {
    fs.mkdirSync(targetNodeModules, { recursive: true });
    for (const dep of deps) {
      const src = path.resolve("node_modules", dep);
      const dest = path.resolve(targetNodeModules, dep);
      if (fs.existsSync(src)) {
        console.log(`[postbuild] Copying ${dep} to ${dest}`);
        fs.cpSync(src, dest, { recursive: true });
      }
    }
  }
}
