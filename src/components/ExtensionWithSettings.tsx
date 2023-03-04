import {useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import CheckoutWithCart from "./CheckoutWithCart";


function SettingsComponent() {
    return <div></div>;
}

export function ExtensionWithSettings() {
    const [isShowingSettings, setIsShowingSettings] = useState(false);
    useSettingsButton(function() {
        setIsShowingSettings(!isShowingSettings);
    });
    if (isShowingSettings) {
        return <SettingsComponent />
    }
    return <CheckoutWithCart/>
}