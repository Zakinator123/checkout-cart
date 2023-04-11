import React, {useState} from "react";
import {Box, Button, FormField, Icon, Input, Link, loadCSSFromString, Loader, Text} from "@airtable/blocks/ui";
import {GlobalConfig} from "@airtable/blocks/types";
import {asyncAirtableOperationWrapper} from "../utils/RandomUtils";
import {toast} from "react-toastify";
import {OfflineToastMessage} from "./OfflineToastMessage";
import {Toast} from "./Toast";

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
    
    .premium-submit-button {
        margin: 0 0 0 1rem;
    }
}
`);

export const Premium = ({isPremiumUser, globalConfig}: {
    isPremiumUser: boolean, globalConfig: GlobalConfig
}) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [verifyButtonDisabledState, setVerifyButtonDisabledState] = useState(false);

    // TODO: Factor out license verification logic from error toast calls to make unit testable.
    const verifyLicense = () => {
        setVerifyButtonDisabledState(true);
        fetch('https://api.gumroad.com/v2/licenses/verify',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    product_id: '0MHZr1PU0NoUFRufCkqCng==',
                    license_key: licenseKey
                })
            })
            .then(response => {
                if (response.status === 404) return undefined;
                if (response.status === 200) return response.json();
                throw new Error('An error occurred verifying the license. Please check your network connection or try again later.')
            })
            .then(responseJson => {
                const responseSuccessful: boolean = responseJson?.success ?? false;
                if (responseSuccessful) {
                    if (responseJson.uses >= 100) toast.error(`This license has already been redeemed. Licenses can only be used once per base.`)
                    else if (globalConfig.hasPermissionToSet('isPremiumUser', true)) asyncAirtableOperationWrapper(() => globalConfig.setAsync('isPremiumUser', true), () => toast.error(
                        <OfflineToastMessage/>))
                        .then(() => toast.success('License verified! You are now a premium user!'))
                        .catch(() => toast.error('Your license is valid, but there was an error saving it! Contact the developer for support.'))
                    else toast.error("You must have base editor permissions to update extension settings.")
                } else toast.error('Invalid license key!')
            })
            .catch(() => toast.error('An error occurred verifying the license. Please check your network connection or try again later.',))
            .finally(() => setVerifyButtonDisabledState(false))
    }

    return <>
        <Box className='centered-premium-container'>
            <Text size='large'>
                Upgrade to premium to enable cart sizes larger than 3 items!
            </Text>
            <Box className='premium-form'>
                <FormField
                    marginBottom={0}
                    label={
                        <>
                            <Icon name="premium" size={12}/> Premium License Key <Icon name="premium" size={12}/>
                        </>
                    }>
                    <Box className='premium-input-box'>
                        <Input value={isPremiumUser ? "✅  You've already upgraded!" : licenseKey}
                               disabled={isPremiumUser}
                               placeholder='Enter license key here..'
                               onChange={e => setLicenseKey(e.target.value)} type='text'></Input>
                        <Button variant='default'
                                className='premium-submit-button'
                                type='submit'
                                disabled={isPremiumUser || verifyButtonDisabledState}
                                onClick={verifyLicense}>
                            {verifyButtonDisabledState && !isPremiumUser ? <>Verifying.. <Loader
                                scale={0.3}/></> : 'Verify License'}
                        </Button>
                    </Box>
                    <Box margin={2}><Text size='small' textColor='gray'>Premium licenses are not transferable between
                        bases.</Text></Box>
                </FormField>
                <Toast/>
                <Box marginTop={2} display='flex' alignContent='center' justifyContent='center'>
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