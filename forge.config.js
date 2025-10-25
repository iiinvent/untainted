module.exports = {
  packagerConfig: {
    icon: "./appicons/untainted",
    name: "untainted",
    executableName: "untainted",
    asar: true,
    prune: true,
    packageManager: "pnpm",
    ignore: [
      "^/node_modules/@electron-forge($|/)",
      "^/node_modules/@types($|/)",
      "^/node_modules/electron-reloader($|/)"
    ]
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "untainted"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"]
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        icon: "./appicons/untainted.png"
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    }
  ]
};
