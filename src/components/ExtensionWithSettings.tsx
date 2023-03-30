import {Heading, loadCSSFromString, useBase, useGlobalConfig} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {Settings} from "./Settings";
import CheckoutWithCart from "./CheckoutWithCart";
import {TablesAndFieldsConfigurationIds, ValidatedTablesAndFieldsConfiguration,} from "../types/ConfigurationTypes";
import {blankConfigurationState} from "../utils/Constants";
import {TransactionService} from "../services/TransactionService";
import {getConfigurationValidatorForBase} from "../services/ConfigurationValidatorService";
// @ts-ignore
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';

/*
    TODO:
        - Make "delete checkouts upon checkin" configurable.
        - Make default due date configurable and hide date field if feature flag is off
        - Add premium license option/logic for doing checkouts with 5+ items.
        ---
        - How to deal with inventories where there are quantities of items??
        - Increase test coverage of extension
        - Show failures/successes per record for executeTransaction.
        - Test out behavior with 50+ items in cart - and include error message to prevent if errors occur.
        - Make config explanation menu minimizable
        - Investigate use of base template instead of "create schema for me" button?
        - Add in a "How this extension works" description.
        - What happens when records limit is reached and a checkouts is created?
        - For user of the extension that don't have permission to write to the table - need to have a permissions check w/ error message
        - Add in developer info/feature request/donate link to the extension
 */

loadCSSFromString(`
.container {
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    overflow: auto;
    gap: 2rem;
    height: 100%;
}

.react-tabs {
    -webkit-tap-highlight-color: transparent;
    width: 90%;
}

.react-tabs__tab-list {
    border-bottom: 1px solid #aaa;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0;
    padding: 0 0 1rem 0;
}

.react-tabs__tab {
    display: inline-block;
    border: 1px solid transparent;
    bottom: -1px;
    position: relative;
    list-style: none;
    padding: 6px 12px;
    cursor: pointer;
}

.react-tabs__tab--selected {
    background: #fff;
    border-color: #aaa;
    color: black;
    border-radius: 5px 5px 5px 5px;
}

.react-tabs__tab--disabled {
    color: GrayText;
    cursor: default;
}

.react-tabs__tab:focus {
    outline: none;
}

.react-tabs__tab-panel {
    display: none;
}

.react-tabs__tab-panel--selected {
    display: block;
    border-color: black;
    border-left: 1px solid #aaa;
    border-right: 1px solid #aaa;
    border-bottom: 1px solid #aaa;
}

@media (min-width: 386px) {
    .react-tabs__tab-list {
        flex-direction: row;
        padding: 0;
    }

    .react-tabs__tab {
        border-bottom: none;
    }

    .react-tabs__tab--selected {
        border-radius: 5px 5px 0 0;
    }
}
`);

export function ExtensionWithSettings() {
    const base = useBase();
    const [tabIndex, setTabIndex] = useState(1);
    const globalConfig = useGlobalConfig();

    const configurationValidator = getConfigurationValidatorForBase(base);
    let extensionConfig = globalConfig.get('extensionConfiguration') as TablesAndFieldsConfigurationIds | undefined;

    type ConfigurationState =
        { state: 'empty', configuration: TablesAndFieldsConfigurationIds }
        | { state: 'invalid', configuration: TablesAndFieldsConfigurationIds }
        | { state: 'valid', configuration: TablesAndFieldsConfigurationIds, tablesAndFields: ValidatedTablesAndFieldsConfiguration };

    const configurationState: ConfigurationState = (() => {
        if (extensionConfig === undefined) {
            return {state: 'empty', configuration: blankConfigurationState};
        } else {
            const validationResult = configurationValidator(extensionConfig);
            return validationResult.errorsPresent ? {
                state: 'invalid',
                configuration: extensionConfig
            } : {
                state: 'valid',
                configuration: extensionConfig,
                tablesAndFields: validationResult.configuration
            };
        }
    })();


    const getCheckOutWithCartTabComponent = () => {
        switch (configurationState.state) {
            case "invalid":
                return <div>Something has changed and your configuration is now invalid. Please correct it in the
                    settings page.</div>;
            case "valid":
                return <CheckoutWithCart transactionService={new TransactionService(configurationState.tablesAndFields)}
                                         config={configurationState.tablesAndFields}/>;
            case 'empty':
                return <div>You must configure this component under the settings menu before you can use it!.</div>;
        }
    }

    return <div className='container'>
        <Heading>🚀 Check Out with Cart 🚀</Heading>
        <Tabs selectedIndex={tabIndex} onSelect={(index: number) => setTabIndex(index)}>
            <TabList>
                <Tab>Checkout Interface</Tab>
                <Tab>Settings</Tab>
                <Tab>How This Extension Works</Tab>
                <Tab>Upgrade to Premium</Tab>
            </TabList>
            <TabPanel>{getCheckOutWithCartTabComponent()}</TabPanel>
            <TabPanel>
                <Settings currentConfiguration={configurationState.configuration}
                          base={base}
                          validateTablesAndFields={configurationValidator}
                          globalConfig={globalConfig}/>
            </TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
        </Tabs>
    </div>;
}