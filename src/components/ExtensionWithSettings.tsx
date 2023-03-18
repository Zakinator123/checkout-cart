import {useBase, useGlobalConfig, useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {Settings} from "./Settings";
import CheckoutWithCart from "./CheckoutWithCart";
import {ExtensionConfigurationIds, ValidatedExtensionConfiguration} from "../types/ConfigurationTypes";
import {blankConfigurationState} from "../utils/Constants";
import {getConfigurationValidatorForBase} from "../services/ConfigurationService";

export function ExtensionWithSettings(this: any) {
    const base = useBase();
    const [isShowingSettings, setIsShowingSettings] = useState(true);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));

    const configurationValidator = getConfigurationValidatorForBase(base);

    const globalConfig = useGlobalConfig();
    let extensionConfig = globalConfig.get('extensionConfiguration') as ExtensionConfigurationIds | undefined;
    let validConfig: ValidatedExtensionConfiguration | undefined;
    if (extensionConfig) {
        try {
            validConfig = configurationValidator.validateIdsAndTransformToTablesAndFieldsOrThrow(extensionConfig)
        } catch (e) {
            setIsShowingSettings(true);
        }
    } else {
        extensionConfig = blankConfigurationState;
    }

    return isShowingSettings || validConfig === undefined
        ? <Settings currentConfiguration={extensionConfig} base={base} configurationValidator={configurationValidator.validateIdsAndTransformToTablesAndFieldsOrThrow}/>
        : <CheckoutWithCart config={validConfig}/>;
}