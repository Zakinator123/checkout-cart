import {Box, Heading, Icon, loadCSSFromString, Loader, useBase, useGlobalConfig} from '@airtable/blocks/ui';
import React, {Suspense, useState} from 'react';
import {Settings} from "./Settings";
import {ExtensionConfiguration,} from "../types/ConfigurationTypes";
import {getConfigurationValidatorForBase} from "../services/ConfigurationValidatorService";
// @ts-ignore
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import CheckoutWithCartWrapper from "./CheckoutWithCartWrapper";
import {About} from "./About";
import {Premium} from "./Premium";

loadCSSFromString(`
.container {
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    gap: 1.5rem;
    height: 100%;
}

.react-tabs {
    -webkit-tap-highlight-color: transparent;
    width: 90%
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-color: black;
    border-left: 1px solid #aaa;
    border-right: 1px solid #aaa;
    border-bottom: 1px solid #aaa;
    margin-bottom: 3rem;
}

@media (min-width: 515px) {
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

.tab-loading-state {
        display: flex;
        align-content: center;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        padding: 5rem;
}
`);

/*
    TODO:
        - Flesh out error handling logic of transactions - Show failures/successes per record for executeTransaction.
            - It seems transactions fail with improper permissions, but there are no error messages being shown.
        - Create schema generation button
        - Investigate use of base template instead of or in addition to "create schema for me" button?'
        - Add schema visualization in settings page
        ---
        - Look into iots for type checking
        - Solicit feedback from AT community on pricing - subscription vs one time payment? How much?
        - Add landing page, and documentation blog/videos
        - Increase test coverage of extension
        - Test out behavior with 50+ items in cart - and include error message to prevent if errors occur.
        - Add in a "How to use this extension" description
        - Put icons for field type of each field in settings page
        - Extract more styles into css classes
        - Extract all strings into a separate file.
        - Extract css for this file into a separate CSS file
 */

export function ExtensionWithSettings() {
    const base = useBase();
    const globalConfig = useGlobalConfig();
    const [configurationUpdatePending, setConfigurationUpdatePending] = useState(false);
    const [transactionIsProcessing, setTransactionIsProcessing] = useState<boolean>(false);

    const configurationValidator = getConfigurationValidatorForBase(base);
    const extensionConfig = globalConfig.get('extensionConfiguration') as ExtensionConfiguration | undefined;
    const isPremiumUser: boolean = (globalConfig.get('isPremiumUser') as boolean | undefined) ?? false;

    return <div className='container'>
        <Heading>🚀 Checkout Cart 🚀</Heading>
        <Tabs defaultIndex={extensionConfig === undefined ? 1 : 0}>
            <TabList>
                <Tab>🛒 Checkout Cart </Tab>
                <Tab><Icon name="cog" size={12}/> Settings</Tab>
                <Tab><Icon name="premium" size={12}/> Premium <Icon fillColor='black' name="premium" size={12}/></Tab>
                <Tab><Icon name="help" size={12}/> About</Tab>
            </TabList>
            <div>
                <TabPanel>
                    <Suspense fallback={
                        <Box className='tab-loading-state'>
                            <Loader scale={0.5} fillColor='green'/>
                        </Box>}>
                        <CheckoutWithCartWrapper
                            extensionConfiguration={extensionConfig}
                            configurationValidator={configurationValidator}
                            isPremiumUser={isPremiumUser}
                            transactionIsProcessing={transactionIsProcessing}
                            setTransactionIsProcessing={setTransactionIsProcessing}/>
                    </Suspense>
                </TabPanel>
            </div>
            <TabPanel>
                <Settings currentTableAndFieldIds={extensionConfig?.tableAndFieldIds}
                          currentOtherConfiguration={extensionConfig?.otherConfiguration}
                          base={base}
                          validateTablesAndFields={configurationValidator}
                          globalConfig={globalConfig}
                          configurationUpdatePending={configurationUpdatePending}
                          setConfigurationUpdatePending={setConfigurationUpdatePending}/>
            </TabPanel>
            <TabPanel><Premium isPremiumUser={isPremiumUser} globalConfig={globalConfig}/></TabPanel>
            <TabPanel><About/></TabPanel>
        </Tabs>
    </div>
}