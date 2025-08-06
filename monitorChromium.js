const fs = require("fs");
const axios = require("axios");

const version_json = "./version.json";

const downloadFile = async (url, dest) => {
    var config = {
        responseType: 'stream'
    };
    const res = await axios.get(url, config);
    const writer = fs.createWriteStream(dest);
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            resolve();
        });
        writer.on('error', (err) => {
            reject();
            console.log("error-----" + err)
        });
    });
};

async function getGoodChromeVersion (dataArray, channel) {
    for (const channelName in dataArray.channels){
        if (channelName.toString()===channel){
            const channelNode = dataArray.channels[channelName];
            let goodChromeVersion = channelNode.version;
            return goodChromeVersion;
        }
    }
};

async function getChromeDownloadURL (dataArray, channel, platform) {
    for (const channelName in dataArray.channels){
        if (channelName.toString() === channel) {
            const channelNode = dataArray.channels[channelName];
            let chromeDownloadList = channelNode.downloads.chrome;
            for (let i = 0; i < chromeDownloadList.length; ++i) {
                let item = chromeDownloadList[i];
                if (item.platform == platform) {
                    let chromeDownloadURl = item.url;
                    return chromeDownloadURl;
                }
            }
        }
    }
};

async function getChromeDriverURL (dataArray, channel, platform) {
    for (const channelName in dataArray.channels){
        if (channelName.toString() === channel) {
            const channelNode = dataArray.channels[channelName];
            let chromeDriverList = channelNode.downloads.chromedriver;
            for (let i = 0; i < chromeDriverList.length; ++i) {
                let item = chromeDriverList[i];
                if (item.platform == platform) {
                    let chromeDriverURl = item.url;
                    return chromeDriverURl;
                }
            }
        }
    }
};

const requestGoodChromeVersion = async (channel) => {
    try {
        const { data } = await axios.get('https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json');
        let goodChromeVersion = await getGoodChromeVersion(data, channel);
        return goodChromeVersion;
        
    } catch (err) {
        console.log(err);
    }
};

const requestChromeDriverURl = async (channel, platform) => {
    try {
        const { data } = await axios.get('https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json');
        let chromeDriverURl = await getChromeDriverURL(data, channel, platform);
        return chromeDriverURl;
    } catch (err) {
        console.log(err);
    }
};

const requestChromeDownloadURl = async (channel, platform) => {
    try {
        const { data } = await axios.get('https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json');
        let chromeDownloadrURl = await getChromeDownloadURL(data, channel, platform);
        return chromeDownloadrURl;
    } catch (err) {
        console.log(err);
    }
};

async function main() {
    const stable_ver = await requestGoodChromeVersion("Stable");
    const beta_ver = await requestGoodChromeVersion("Beta");
    const stable_Dowload_url_win64 = await requestChromeDownloadURl("Stable", "win64");
    const beta_Dowload_url_win64 = await requestChromeDownloadURl("Beta", "win64");
    const stable_Driver_url_win64 = await requestChromeDriverURl("Stable", "win64");
    const beta_Driver_url_win64 = await requestChromeDriverURl("Beta", "win64");

    const stable_Dowload_url_linux64 = await requestChromeDownloadURl("Stable", "linux64");
    const beta_Dowload_url_linux64 = await requestChromeDownloadURl("Beta", "linux64");
    
    let pre_stable_ver = null;
    let pre_beta_ver = null;
    let ver_obj = null;
    try {
        ver_obj = JSON.parse(fs.readFileSync(version_json));
        pre_stable_ver = ver_obj.Chrome.previous_stable_version || null;
        pre_beta_ver = ver_obj.Chrome.previous_beta_version || null;
    } catch (error) {
        console.log(error);
        // the first run, we don't have version.json
    }
    ver_obj = ver_obj || {};

    if (pre_stable_ver != stable_ver) {
        console.log("new stable version detect: Chrome (stable) " + stable_ver);
        // write to file
        ver_obj.Chrome.previous_stable_version = stable_ver;
        fs.writeFileSync(version_json, JSON.stringify(ver_obj, null, "\t"));
        //give the key to jenkins to trigger API and UI automation as there is new version of chrome
        fs.writeFileSync('./isNewVersion_chrome_stable.txt', `new_chrome_stable_version=${stable_ver}\n`);
    } else
    {
        console.log(`Not find new chrome stable build, current stable build is: ${pre_stable_ver}`)
    }
    if (pre_beta_ver != beta_ver){
        console.log("new beta version detect: Chrome (beta)" + beta_ver);
        // write to file
        ver_obj.Chrome.previous_beta_version = beta_ver;
        fs.writeFileSync(version_json, JSON.stringify(ver_obj, null, "\t"));
        //give the key to jenkins to trigger API and UI automation as there is new version of chrome
        fs.writeFileSync('./isNewVersion_chrome_beta.txt', `new_chrome_beta_version=${beta_ver}\n`);
    }else
    {
        console.log(`Not find new chrome beta build, current beta build is: ${pre_beta_ver}`)
    }
    
};
main().catch(console.error);
