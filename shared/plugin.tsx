import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BbbPluginSdk } from 'bigbluebutton-html-plugin-sdk';

// The themes are pure CSS: each theme's index.tsx imports its stylesheets,
// which style-loader injects into <head> as soon as the bundle runs. The
// plugin only has to register itself with the client.
function MainComponent({ pluginUuid }: { pluginUuid: string }): React.ReactElement {
  BbbPluginSdk.initialize(pluginUuid);
  return null;
}

const uuid = document.currentScript?.getAttribute('uuid') || 'root';
const root = ReactDOM.createRoot(document.getElementById(uuid));
root.render(<MainComponent pluginUuid={uuid} />);
