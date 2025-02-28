import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { getSimulator } from 'appium-ios-simulator';
import { shutdownSimulator, deleteDeviceWithRetry } from '../helpers/simulator';
import { createDevice } from 'node-simctl';
import { MOCHA_TIMEOUT, initSession, deleteSession } from '../helpers/session';
import { MULTIPLE_APPS } from '../desired';


const SIM_DEVICE_NAME = 'xcuitestDriverTest';

chai.should();
chai.use(chaiAsPromised);

describe('XCUITestDriver', function () {
  this.timeout(MOCHA_TIMEOUT);

  let baseCaps;
  let caps;

  let driver;
  before(async function () {
    const udid = await createDevice(SIM_DEVICE_NAME,
      MULTIPLE_APPS.deviceName, MULTIPLE_APPS.platformVersion);
    baseCaps = Object.assign({}, MULTIPLE_APPS, {udid});
    caps = Object.assign({
      usePrebuiltWDA: true,
      wdaStartupRetries: 0,
    }, baseCaps);
  });
  after(async function () {
    const sim = await getSimulator(caps.udid);
    await shutdownSimulator(sim);
    await deleteDeviceWithRetry(caps.udid);
  });

  afterEach(async function () {
    // try to get rid of the driver, so if a test fails the rest of the
    // tests aren't compromised
    await deleteSession();
  });

  if (!process.env.REAL_DEVICE) {
    it('should start and stop a session', async function () {
      driver = await initSession(caps);
      (await driver.isAppInstalled('io.appium.TestApp')).should.equal(true);
      (await driver.isAppInstalled('com.example.apple-samplecode.UICatalog')).should.equal(true);
    });
  }
});
