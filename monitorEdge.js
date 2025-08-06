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

async function getEdgeVersion(dataArray, channel, platform) {
    for (const product of dataArray) {
        if (product.Product === channel) {
            for (const release of product.Releases) {
                if (release.Platform === platform && release.Architecture === "x64") {
                    return release.ProductVersion;
                }
            }
        }
    }
    return null;
};

async function getEdgeDownloadURL (dataArray, channel, platform) {
    for (const product of dataArray) {
        if (product.Product === channel) {
            for (const release of product.Releases) {
                if (release.Platform === platform && release.Architecture === "x64") {
                    const artifact = release.Artifacts[0];
                    if (artifact) {
                        return artifact.Location;
                    }
                    
                }
            }
        }
    }
    return null;
};

const requestEdgeVersion = async (channel, platform) => {
    try {
        const { data } = await axios.get('https://edgeupdates.microsoft.com/api/products');
        let edgeVersion = await getEdgeVersion(data, channel, platform);
        return edgeVersion;
    } catch (err) {
        console.log(err);
    }
};

const requestEdgeDownloadURl = async (channel, platform) => {
    try {
        const { data } = await axios.get('https://edgeupdates.microsoft.com/api/products');
        let edgeDownloadrURl = await getEdgeDownloadURL(data, channel, platform);
        return edgeDownloadrURl;
    } catch (err) {
        console.log(err);
    }
};

async function main() {
    const stable_ver = await requestEdgeVersion("Stable", "Windows");
    const beta_ver = await requestEdgeVersion("Beta", "Windows");
    const stable_Dowload_url_win64 = await requestEdgeDownloadURl("Stable", "Windows");
    const beta_Dowload_url_win64 = await requestEdgeDownloadURl("Beta", "Windows");

    const stable_ver_linux64 = await requestEdgeVersion("Stable", "Linux");
    const beta_ver_linux64 = await requestEdgeVersion("Beta", "Linux");
    const stable_Dowload_url_linux64 = await requestEdgeDownloadURl("Stable", "Linux");
    const beta_Dowload_url_linux64 = await requestEdgeDownloadURl("Beta", "Linux");
    
    let pre_stable_ver = null;
    let pre_beta_ver = null;
    let ver_obj = null;
    try {
        ver_obj = JSON.parse(fs.readFileSync(version_json));
        pre_stable_ver = ver_obj.Edge.previous_stable_version || null;
        pre_beta_ver = ver_obj.Edge.previous_beta_version || null;
    } catch (error) {
        console.log(error);
        // the first run, we don't have version.json
    }

    ver_obj = ver_obj || {};

    if (pre_stable_ver != stable_ver) {
        console.log("new stable version detect: Edge (stable) " + stable_ver);
        // write to file
        ver_obj.Edge.previous_stable_version = stable_ver;
        fs.writeFileSync(version_json, JSON.stringify(ver_obj, null, "\t"));
        //give the key to jenkins to trigger API and UI automation as there is new version of chrome
        fs.writeFileSync('./isNewVersion_edge_stable.txt', `new_edge_stable_version=${stable_ver}\n`);
    } else
    {
        console.log(`Not find new edge stable build, current stable build is: ${pre_stable_ver}`)
    }

    if (pre_beta_ver != beta_ver){
        console.log("new beta version detect: Edge (beta)" + beta_ver);
        // write to file
        ver_obj.Edge.previous_beta_version = beta_ver;
        fs.writeFileSync(version_json, JSON.stringify(ver_obj, null, "\t"));
        //give the key to jenkins to trigger API and UI automation as there is new version of chrome
        fs.writeFileSync('./isNewVersion_edge_beta.txt', `new_edge_beta_version=${beta_ver}\n`);
    }else
    {
        console.log(`Not find new chrome beta build, current beta build is: ${pre_beta_ver}`)
    }
};
main().catch(console.error);
