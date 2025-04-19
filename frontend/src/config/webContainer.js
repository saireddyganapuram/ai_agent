import {WebContainer} from '@webcontainer/api';

let webContainerInstance = null;

export const getWebContainer = async () => {
    if (!webContainerInstance) {
        webContainerInstance = await WebContainer.boot();
;
    }
    return webContainerInstance;
};
