import React, {useState} from "react";
import {Box, Button, FormField, Icon, Input, Link, loadCSSFromString, Loader, Text} from "@airtable/blocks/ui";
import toast from "react-hot-toast";
import {GlobalConfig} from "@airtable/blocks/types";

loadCSSFromString(`
.centered-premium-container {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
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
    gap: 1rem;
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
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson?.success) {
                    globalConfig.setAsync('isPremiumUser', true)
                        .then(() => toast.success('License verified!'))
                        .catch(() => {
                            setVerifyButtonDisabledState(false);
                            toast.error('Error saving license key! Contact the developer for support.')
                        })
                        .finally(() => {
                            setVerifyButtonDisabledState(false);
                        });
                } else toast.error('Invalid license key!')
            })
            .finally(() => setVerifyButtonDisabledState(false))
    }

    return <Box className='centered-premium-container'>
        <Text size='large'>
            Upgrade to premium to enable cart sizes larger than 3 items!
        </Text>
        <Box className='premium-form'>
            <FormField
                label={<><Icon name="premium" size={12}/> Premium License Key <Icon name="premium"
                                                                                    size={12}/></>}>
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
            </FormField>
            <Box display='flex' alignContent='center' justifyContent='center'>
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
}