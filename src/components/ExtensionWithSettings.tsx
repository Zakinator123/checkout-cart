import {Box, Heading, Icon, loadCSSFromString, Loader, useBase, useGlobalConfig} from '@airtable/blocks/ui';
import React, {Suspense} from 'react';
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
    overflow: auto;
    gap: 1.5rem;
    height: 100%;
}

.react-tabs {
    -webkit-tap-highlight-color: transparent;
    width: 80%
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
        - Create schema generation button
        - Figure out offline no-network connection logic
        ---
        - Look into iots for type checking
        - If config changes were made but not saved, warn user?
        - If premium is not active, show message on cart that max cart limit is 3 for free users.
        - Figure out how to make text of tooltips wrap in order to fit in the viewport.
        - Add landing page, and documentation blog/videos?
        - How to deal with inventories where there are quantities of items??
        - Increase test coverage of extension
        - Show failures/successes per record for executeTransaction.
        - Test out behavior with 50+ items in cart - and include error message to prevent if errors occur.
        - Investigate use of base template instead of or in addition to "create schema for me" button?
        - Add in a "How this extension works" description
        - Add info that licenses can only be redeemed once to both gumroad and premium page.
        - Add info in about page that write permissions and network access are required for the extension to work.
        - What happens when records limit is reached and a checkouts is created?
        - For user of the extension that don't have permission to write to the table - need to have a permissions check w/ error message
 */

export function ExtensionWithSettings() {
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const configurationValidator = getConfigurationValidatorForBase(base);
    const extensionConfig = globalConfig.get('extensionConfiguration') as ExtensionConfiguration | undefined;
    const isPremiumUser: boolean = (globalConfig.get('isPremiumUser') as boolean | undefined) ?? false;

    console.log(`Network status: ${navigator.onLine}`);
    return <div className='container'>
        <Heading>🚀 Checkout Cart 🚀</Heading>
        <Tabs defaultIndex={extensionConfig === undefined ? 3 : 0}>
            <TabList>
                <Tab>🛒 Checkout Cart </Tab>
                <Tab><Icon name="cog" size={12}/> Settings</Tab>
                <Tab><Icon name="premium" size={12}/> Premium <Icon fillColor='black' name="premium" size={12}/></Tab>
                <Tab><Icon name="help" size={12}/> About</Tab>
            </TabList>
            <TabPanel>
                <Suspense fallback={
                    <Box className='tab-loading-state'>
                        <Loader scale={0.5}/>
                    </Box>
                }>
                    <CheckoutWithCartWrapper
                        extensionConfiguration={extensionConfig}
                        configurationValidator={configurationValidator}
                        isPremiumUser={isPremiumUser}/>
                </Suspense>
            </TabPanel>
            <TabPanel>
                <Settings currentTableAndFieldIds={extensionConfig?.tableAndFieldIds}
                          currentOtherConfiguration={extensionConfig?.otherConfiguration}
                          base={base}
                          validateTablesAndFields={configurationValidator}
                          globalConfig={globalConfig}/>
            </TabPanel>
            <TabPanel><Premium isPremiumUser={isPremiumUser} globalConfig={globalConfig}/></TabPanel>
            <TabPanel><About/></TabPanel>
        </Tabs>
    </div>
}