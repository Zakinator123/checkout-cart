import {Box, Heading, Icon, Text, loadCSSFromString, Loader, useBase, useGlobalConfig} from '@airtable/blocks/ui';
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
import {IconName} from "@airtable/blocks/dist/types/src/ui/icon_config";

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
        - Add premium subscription checking code
        - Figure out UTC date situation for date fields..
        - Add landing page, and documentation blog/videos
        - Increase test coverage of extension
        - Purchase domain name(s)?
        - Create email address with custom domain for support page

        - Add a "reset to default" button in settings page?
        - Add schema visualization in settings page
        - Make form validation error messages that reference table names and/or field types more user friendly.
        - Set up github sponsors page/info
        - Investigate use of base template in addition to "generate schema" button?'
        - Look into iots for type checking
        - Put icons for field type of each field in settings page
        - SEO Research for 'building library systems on airtable' ?
        - Create use case videos/blogs for how to run a library business, rental equipment business, gear inventory business, etc.
        - Extract more styles into css classes
        - Extract all strings into a separate file.
        - Extract css for this file into a separate CSS file
 */

export function ExtensionWithSettings() {
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const [configurationUpdatePending, setConfigurationUpdatePending] = useState(false);
    const [transactionIsProcessing, setTransactionIsProcessing] = useState<boolean>(false);
    const [premiumUpdatePending, setPremiumUpdatePending] = useState(false);

    const updatePending = configurationUpdatePending || transactionIsProcessing || premiumUpdatePending;

    const configurationValidator = getConfigurationValidatorForBase(base);
    const rateLimiter = new RateLimiter(15, 1000);
    const airtableMutationService = new AirtableMutationService(rateLimiter);

    const extensionConfig = globalConfig.get('extensionConfiguration') as ExtensionConfiguration | undefined;
    const premiumLicense: string | undefined = (globalConfig.get('premiumLicense') as string | undefined);

    const isPremiumUser = premiumLicense !== undefined && premiumLicense !== '';

    const [tabIndex, setTabIndex] = useState(extensionConfig === undefined ? 3 : 0);

    const TabText = ({text}: { text: string }) =>
        <Text display='inline-block'
              textColor={updatePending ? 'lightgray' : 'black'}>
            &nbsp;{text}&nbsp;
        </Text>

    const TabIcon = ({iconName}: { iconName: IconName}) =>
        <Icon fillColor={updatePending ? 'lightgray' : 'black'} name={iconName} size={12}/>


    return <Box className='container'>
        <Heading size='large'>🚀 &nbsp; Library Cart &nbsp; 🚀</Heading>
        <Tabs selectedIndex={tabIndex} onSelect={(index: number) => {
            if (!updatePending)
                setTabIndex(index);
        }}>
            <TabList>
                <Tab>🛒 <TabText text='Checkout Cart'/></Tab>
                <Tab>
                    <TabIcon iconName="cog"/>
                    <TabText text='Settings'/>
                </Tab>
                <Tab>
                    <TabIcon iconName="premium"/>
                    <TabText text='Premium'/>
                    <TabIcon iconName="premium"/>
                </Tab>
                <Tab>
                    <TabIcon iconName="help"/>
                    <TabText text='About'/>
                </Tab>
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
                <Settings
                    currentTableAndFieldIds={extensionConfig?.tableAndFieldIds}
                    currentOtherConfiguration={extensionConfig?.otherConfiguration}
                    base={base}
                    validateTablesAndFields={configurationValidator}
                    validateConfigUpdateAndSaveToGlobalConfig={getExtensionConfigSaver(globalConfig, configurationValidator)}
                    configurationUpdatePending={configurationUpdatePending}
                    setConfigurationUpdatePending={setConfigurationUpdatePending}/>
            </TabPanel>
            <TabPanel>
                <Premium
                    isPremiumUser={isPremiumUser}
                    premiumUpdatePending={premiumUpdatePending}
                    setPremiumUpdatePending={setPremiumUpdatePending}
                    globalConfig={globalConfig}/>
            </TabPanel>
            <TabPanel><About/></TabPanel>
        </Tabs>
    </Box>
}