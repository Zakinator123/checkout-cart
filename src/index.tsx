import React from "react";
import {initializeBlock} from '@airtable/blocks/ui';
import {ExtensionWithSettings} from "./components/ExtensionWithSettings";
import {Toast} from "./components/Toaster";

initializeBlock(() => <><Toast/><ExtensionWithSettings/></>);
