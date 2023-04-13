import {Box, Heading, Icon, loadCSSFromString, Loader, useBase, useGlobalConfig} from '@airtable/blocks/ui';
import React, {Suspense, useState} from 'react';
import {Settings} from "./Settings";
import {ExtensionConfiguration,} from "../types/ConfigurationTypes";
import {getConfigurationValidatorForBase} from "../services/ConfigurationValidatorService";
// @ts-ignore
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import CheckoutCartWrapper from "./CheckoutCartWrapper";
import {About} from "./About";
import {Premium} from "./Premium";
import {getExtensionConfigSaver} from "../services/GlobalConfigUpdateService";
import {RateLimiter} from "../utils/RateLimiter";
import {AirtableMutationService} from "../services/AirtableMutationService";

loadCSSFromString(`
.container {
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    gap: 0.75rem;
    height: 100%;
    overflow: hidden;
}

.react-tabs {
    -webkit-tap-highlight-color: transparent;
    width: 90%;
    max-width: 1000px;
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
    align-items: center;
    justify-content: center;
    border-color: black;
    margin-bottom: 3rem;
}

ol, ul {
    padding-inline-start: 1.5rem;
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
    
    ol, ul {
        padding-inline-start: 2.5rem;
    }
    
    .react-tabs__tab-panel--selected {
        border-left: 1px solid #aaa;
        border-right: 1px solid #aaa;
        border-bottom: 1px solid #aaa;
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
        - Figma screenshots and video walkthrough
        - Disable config fields when configurationUpdate is pending
        - Autonumber primary field?
        -------

        - Premium license redemption limit
        - Solicit feedback from AT community on pricing - subscription vs one time payment? How much?
        - Ask airtable community on license verification strategy. Should I prepare for adversaries?
        - Add schema visualization in settings page
        - Make form validation error messages that reference table names and/or field types more user friendly.
        - Set up github sponsors page/info
        - Investigate use of base template in addition to "generate schema" button?'
        - Look into iots for type checking
        - Put icons for field type of each field in settings page
        - SEO Research for 'building library systems on airtable' ?
        - Purchase domain name(s)?
        - Create email address with custom domain for support page
        - Figure out UTC date situation for date fields..
        - Add landing page, and documentation blog/videos
        - Create use case videos/blogs for how to run a library business, rental equipment business, gear inventory business, etc.
        - Increase test coverage of extension
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
    const rateLimiter = new RateLimiter(15, 1000);
    const airtableMutationService = new AirtableMutationService(rateLimiter);

    const extensionConfig = globalConfig.get('extensionConfiguration') as ExtensionConfiguration | undefined;
    const isPremiumUser: boolean = (globalConfig.get('isPremiumUser') as boolean | undefined) ?? false;

    return <Box className='container'>
        <Heading>🚀 Checkout Cart 🚀</Heading>
        <Tabs defaultIndex={extensionConfig === undefined ? 3 : 0}>
            <TabList>
                <Tab>🛒 Checkout Cart </Tab>
                <Tab><Icon name="cog" size={12}/> Settings</Tab>
                <Tab><Icon name="premium" size={12}/> Premium <Icon fillColor='black' name="premium" size={12}/></Tab>
                <Tab><Icon name="help" size={12}/> About</Tab>
            </TabList>
            <Box>
                <TabPanel>
                    <Suspense fallback={
                        <Box className='tab-loading-state'>
                            <Loader scale={0.5} fillColor='#888'/>
                        </Box>}>
                        <CheckoutCartWrapper
                            airtableMutationService={airtableMutationService}
                            extensionConfiguration={extensionConfig}
                            configurationValidator={configurationValidator}
                            isPremiumUser={isPremiumUser}
                            transactionIsProcessing={transactionIsProcessing}
                            setTransactionIsProcessing={setTransactionIsProcessing}/>
                    </Suspense>
                </TabPanel>
            </Box>
            <TabPanel>
                <Settings currentTableAndFieldIds={extensionConfig?.tableAndFieldIds}
                          currentOtherConfiguration={extensionConfig?.otherConfiguration}
                          base={base}
                          validateTablesAndFields={configurationValidator}
                          validateConfigUpdateAndSaveToGlobalConfig={getExtensionConfigSaver(globalConfig, configurationValidator)}
                          configurationUpdatePending={configurationUpdatePending}
                          setConfigurationUpdatePending={setConfigurationUpdatePending}/>
            </TabPanel>
            <TabPanel><Premium isPremiumUser={isPremiumUser} globalConfig={globalConfig}/></TabPanel>
            <TabPanel><About/></TabPanel>
        </Tabs>
    </Box>
}