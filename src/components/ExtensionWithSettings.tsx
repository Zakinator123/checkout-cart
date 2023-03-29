import {useBase, useGlobalConfig, useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {Settings} from "./Settings";
import CheckoutWithCart from "./CheckoutWithCart";
import {TablesAndFieldsConfigurationIds} from "../types/ConfigurationTypes";
import {blankConfigurationState} from "../utils/Constants";
import {TransactionService} from "../services/TransactionService";
import {getConfigurationValidatorForBase} from "../services/ConfigurationValidatorService";

/*
    TODO:
        - Increase test coverage of extension
        - Show failures/successes per record for executeTransaction.
        - Test out behavior with 50+ items in cart - and include error message to prevent if errors occur.
        - Add settings option for deleting checkouts instead of marking them as checked in (with warning).
        - Make config explanation menu minimizable
        - Investigate use of base template instead of "create schema for me" button?
        - Add in a "How this extension works" description.
        - Make "delete checkouts upon checkin" configurable.
        - What happens when records limit is reached and a checkouts is created?
        - For user of the extension that don't have permission to write to the table - need to have a permissions check w/ error message
        - Add in developer info/feature request/donate link to the extension
        - Add premium license option/logic for doing checkouts with 5+ items.
        - Make default due date configurable and hide date field if feature flag is off
        - Investigate missing cart id error and refine random id logic - maybe change to guid?
 */

export function ExtensionWithSettings() {
    const base = useBase();
    const [isShowingSettings, setIsShowingSettings] = useState(false);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));

    const configurationValidator = getConfigurationValidatorForBase(base);

    const globalConfig = useGlobalConfig();
    let extensionConfig = globalConfig.get('extensionConfiguration') as TablesAndFieldsConfigurationIds | undefined;
    if (!extensionConfig) {
        extensionConfig = blankConfigurationState;
        if (!isShowingSettings) setIsShowingSettings(true);
    } else if (!isShowingSettings) {
        const validationResult = configurationValidator(extensionConfig);
        if (validationResult.errorsPresent) {
            setIsShowingSettings(true);
        } else {
            const transactionService = new TransactionService(validationResult.configuration);
            return <CheckoutWithCart transactionService={transactionService} config={validationResult.configuration}/>;
        }
    }

    return <Settings currentConfiguration={extensionConfig} base={base}
                     configurationValidator={configurationValidator}
                     globalConfig={globalConfig}/>
}