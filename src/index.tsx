import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import pickerCss from './picker.css';
import { applyTheme, injectPickerStyles, readApplied } from './apply';
import Plugin from './Plugin';
import { swatchCss } from './Picker';

// Right away, before React mounts: the picker styles, and the theme applied on
// the last visit, so the page does not flash the plain look while the plugin
// settings load. Plugin then switches to the right theme once they are in.
injectPickerStyles(`${pickerCss}\n${swatchCss()}`);
applyTheme(readApplied());

const uuid = document.currentScript?.getAttribute('uuid') || 'root';
const host = document.getElementById(uuid);
const root = ReactDOM.createRoot(host);
root.render(<Plugin uuid={uuid} />);

// BigBlueButton 4.0 may load the plugin again under a new uuid (on some layout
// switches) and drop this host element without unmounting it. This copy then
// retires: no menu entry, no picker, no theme changes left behind.
const watch = window.setInterval(() => {
  if (host.isConnected) return;
  window.clearInterval(watch);
  root.unmount();
}, 1000);
