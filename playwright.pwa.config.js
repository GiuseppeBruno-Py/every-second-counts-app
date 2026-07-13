const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir:'./tests/production',
  timeout:30000,
  retries:1,
  workers:1,
  use:{
    ...devices['Desktop Chrome'],
    baseURL:'http://127.0.0.1:4174',
    trace:'retain-on-failure',
    serviceWorkers:'allow',
    launchOptions:process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH, args:['--no-sandbox','--disable-setuid-sandbox'] }
      : undefined
  },
  webServer:{
    command:'python3 -m http.server 4174 -d .',
    port:4174,
    reuseExistingServer:true
  }
});
