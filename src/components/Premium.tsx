import React, {useEffect, useState} from "react";
import {Box, Button, FormField, Icon, Input, Link, loadCSSFromString, Loader, Text} from "@airtable/blocks/ui";
import {GlobalConfig} from "@airtable/blocks/types";
import {asyncAirtableOperationWrapper} from "../utils/RandomUtils";
import {toast} from "react-toastify";
import {OfflineToastMessage} from "./OfflineToastMessage";
import {Toast} from "./Toast";
import {GumroadLicenseVerificationService, PremiumStatus} from "../services/LicenseVerificationService";

loadCSSFromString(`
.centered-premium-container {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    gap: 1rem;
}

.premium-input-box {
    display: flex;
    flex-direction: column;
}

.premium-submit-button {
    margin: 1rem 0 0 0;
}

.premium-form-field {
    margin: 0 0 1rem 0;
}

.premium-form {
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
    width: 70vw;
    max-width: 450px;
}

@media (min-width: 515px) {
    .premium-input-box {
        flex-direction: row;
    }
    
    .premium-form-field {
    margin: 0;
}
    
    .premium-submit-button {
        margin: 0 0 0 1rem;
    }
}
`);

export const Premium = ({
                            licenseVerificationService,
                            premiumStatus,
                            setPremiumStatus,
                            premiumUpdatePending,
                            setPremiumUpdatePending,
                            globalConfig,
                            currentPremiumLicense
                        }: {
    licenseVerificationService: GumroadLicenseVerificationService
    premiumStatus: PremiumStatus,
    setPremiumStatus: (status: PremiumStatus) => void,
    premiumUpdatePending: boolean,
    setPremiumUpdatePending: (pending: boolean) => void,
    globalConfig: GlobalConfig,
    currentPremiumLicense: string | undefined,
}) => {
    const [licenseKey, setLicenseKey] = useState(currentPremiumLicense ?? '');
    useEffect(() => () => toast.dismiss(), []);

    const premiumToastContainerId = 'premium-toast-container'

    const verifyLicense = () => {
        setPremiumUpdatePending(true);

        if (globalConfig.hasPermissionToSet('premiumLicense', true)) {
            licenseVerificationService.verifyLicense(licenseKey, true)
                .then(result => {
                    if (result.premiumStatus === 'premium') {
                        asyncAirtableOperationWrapper(() => globalConfig.setAsync('premiumLicense', licenseKey),
                            () => toast.loading(<OfflineToastMessage/>, {
                                autoClose: false,
                                containerId: premiumToastContainerId
                            }))
                            .then(() => {
                                setPremiumStatus('premium');
                                return toast.success(result.message, {
                                    autoClose: 5000,
                                    containerId: premiumToastContainerId
                                });
                            })
                            .catch(() => {
                                licenseVerificationService.decrementGumroadLicenseUsesCount(licenseKey);
                                toast.error('Your license is valid, but there was an error saving it! Contact the developer for support.', {
                                    autoClose: 8000,
                                    containerId: premiumToastContainerId
                                });
                            })
                    } else toast.error(result.message, {containerId: premiumToastContainerId});
                })
                .finally(() => setPremiumUpdatePending(false))
        } else {
            toast.error("You must have base editor permissions to upgrade this extension to premium.", {
                autoClose: 5000,
                containerId: premiumToastContainerId
            });
            setPremiumUpdatePending(false);
        }
    }

    let infoMessage;
    switch (premiumStatus) {
        case 'premium':
            infoMessage = "✅  You've already upgraded!";
            break;
        case 'expired':
            infoMessage = "❌  Your premium subscription is no longer active. Purchase and verify a new subscription license to continue using premium features.";
            break;
        case 'unable-to-verify':
            infoMessage = "❌  Unable to verify license. Check your network connection and reload the extension.";
            break;
        case 'free':
            infoMessage = '';
    }


    return <>
        <Box className='centered-premium-container'>
            <Text marginBottom={3} size='large'>
                Upgrade to premium to enable cart sizes larger than 3 items!
            </Text>
            {infoMessage &&
                <Text maxWidth='450px' marginBottom='1rem'>
                    {infoMessage}
                </Text>
            }
            <Box className='premium-form'>
                <FormField
                    className='premium-form-field'
                    marginBottom={0}
                    label={
                        <><Icon name="premium" size={12}/> Premium License Key <Icon name="premium" size={12}/></>
                    }>
                    <Box className='premium-input-box'>
                        <Input value={licenseKey}
                               disabled={premiumStatus === 'premium' || (premiumStatus === 'unable-to-verify' && currentPremiumLicense !== undefined) || premiumUpdatePending}
                               placeholder='Enter license key here..'
                               onChange={e => setLicenseKey(e.target.value)} type='text'></Input>
                        <Button variant='default'
                                className='premium-submit-button'
                                type='submit'
                                disabled={premiumStatus === 'premium' || (premiumStatus === 'unable-to-verify' && currentPremiumLicense !== undefined) || premiumUpdatePending}
                                onClick={verifyLicense}>
                            {premiumUpdatePending ? <Loader
                                scale={0.3}/> : 'Verify License'}
                        </Button>
                    </Box>
                    <Box margin={2}><Text size='small' textColor='gray'>Premium licenses are not transferable between
                        bases.</Text></Box>
                </FormField>
                <Toast containerId={premiumToastContainerId}/>
                <Box marginTop={3} display='flex' alignContent='center' justifyContent='center'>
                    <Link
                        href="https://airtablecheckoutcart.gumroad.com/l/checkout-cart"
                        target="_blank">
                        <Button variant='primary'>
                            Purchase License
                        </Button>
                    </Link>
                </Box>
            </Box>
        </Box>
    </>
}