import {useBase, useGlobalConfig, useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {Settings} from "./Settings";
import CheckoutWithCart from "./CheckoutWithCart";
import {ExtensionConfigurationIds, ValidatedExtensionConfiguration} from "../types/ConfigurationTypes";
import {blankConfigurationState} from "../utils/Constants";
import {getConfigurationValidatorForBase} from "../services/ConfigurationService";
import {TransactionService} from "../services/TransactionService";

export function ExtensionWithSettings(this: any) {
    const base = useBase();
    const [isShowingSettings, setIsShowingSettings] = useState(false);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));

    const configurationValidator = getConfigurationValidatorForBase(base);

    const globalConfig = useGlobalConfig();
    let extensionConfig = globalConfig.get('extensionConfiguration') as ExtensionConfigurationIds | undefined;
    let validConfig: ValidatedExtensionConfiguration | undefined;

    if (!extensionConfig) {
        extensionConfig = blankConfigurationState;
        if (!isShowingSettings) setIsShowingSettings(true);
    }

    if (extensionConfig && !isShowingSettings) {
        try {
            validConfig = configurationValidator.validateIdsAndTransformToTablesAndFieldsOrThrow(extensionConfig, false);
            const transactionService = new TransactionService(validConfig);
            return <CheckoutWithCart transactionService={transactionService} config={validConfig}/>;
        } catch (e) {
            setIsShowingSettings(true);
        }
    }

    return <Settings currentConfiguration={extensionConfig} base={base}
                  configurationValidator={configurationValidator.validateIdsAndTransformToTablesAndFieldsOrThrow}
                  globalConfig={globalConfig}/>
}