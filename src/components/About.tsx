import React from "react";
import {Box, Link, loadCSSFromString, Text} from "@airtable/blocks/ui";
import {CollapsibleSectionHeader} from "./CollapsibleSectionHeader";
import Collapsible from "react-collapsible";

loadCSSFromString(`
.centered-about-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    max-width: 1000px;
}`);

export const About = () => {
    return <Box className='centered-about-container'>
        <Text as='h3' fontWeight={600} size='xlarge'>How this extension works:</Text>
        <br/>

        <Collapsible
            trigger={CollapsibleSectionHeader(false, 'Check-Outs:')}
            triggerWhenOpen={CollapsibleSectionHeader(true, 'Check-Outs:')}
        >
            <br/>
            <Box paddingLeft='2rem'>
                When the transaction type is set to &quot;Check Out&quot;, items are added to the cart,
                a user is associated with the cart, and the &quot;Check Out Items&quot; button is pressed,
                this extension will:
                <ol>
                    <li>Find checkouts associated with items in the cart that are not &quot;checked in&quot; (called &quot;Open Checkouts&quot;)
                        and mark them as checked in with the configured checkbox field. This prevents the item from having multiple open checkouts simultaneously.
                        (E.g. A book cannot be checked out to two different people at the same time.)
                        <br/>
                        <br/>
                        <ul><li><strong>If the &quot;Delete Open Checkouts Upon Check-In&quot; setting is enabled: </strong>
                            Instead of being marked as &quot;checked in&quot; the <strong>Open</strong> Checkouts will be deleted entirely.
                            Existing checkouts associated with the item that are already marked as &quot;checked in&quot; will not be deleted.
                            </li></ul>
                    </li>
                    <br/>
                    <li>For every item in the cart, create a new checkout record that is linked to that item and linked
                        to the user associated with the cart.
                    </li>
                    <br/>
                    <li>
                        If configured in the settings, the extension can also populate the following data in the newly
                        created checkouts:
                        <ul>
                            <li>&quot;Date Checked Out&quot; to indicate when a checkout record was created.</li>
                            <li>&quot;Date Due&quot; to track when outstanding checked out items are due.</li>
                            <li>&quot;Date Checked In&quot; to track when items are checked in.</li>
                            <li>&quot;Cart Id&quot; to indicate what other checkouts were in the same cart.</li>
                        </ul>
                    </li>
                </ol>
            </Box>
        </Collapsible>
        <br/>

        <Collapsible
            trigger={CollapsibleSectionHeader(false, 'Check-Ins:')}
            triggerWhenOpen={CollapsibleSectionHeader(true, 'Check-Ins:')}
        >
            <br/>
            <Box paddingLeft='2rem'>
                When the transaction type is set to &quot;Check In&quot;, items are added to the cart,
                and the &quot;Check In Items&quot; button is pressed, this extension will:
                <ol>
                    <li>Find checkouts associated with items in the cart that are not &quot;checked in&quot; (called &quot;Open Checkouts&quot;)
                        and mark them as checked in with the configured checkbox field. (Same as step 1 above for Check-Outs)
                        <br/>
                        <br/>
                        <ul><li><strong>If the &quot;Delete Open Checkouts Upon Check-In&quot; setting is enabled: </strong>
                            Instead of being marked as &quot;checked in&quot; the <strong>Open</strong> Checkouts will be deleted entirely.
                            Existing checkouts associated with the item that are already marked as &quot;checked in&quot; will not be deleted.
                        </li></ul>
                    </li>
                    <br/>
                    <li>If configured in the settings, the extension can also populate the &quot;Date Checked
                        In&quot; on all the open checkouts that are checked in.
                    </li>
                </ol>
            </Box>
        </Collapsible>
        <br/>
        <Text as='h3' fontWeight={600} size='xlarge'>Support:</Text>
        <br/>
        <Box paddingLeft='1rem'>
            Bug reports, questions, and consultation/customization inquiries can be sent to the developer at&nbsp;
            <Link href='mailto:zakeyf@protonmail.com'>zakeyf@protonmail.com</Link>
            <br/>
            <br/>
            <Text>
                If you would like to support the development of this extension, please consider purchasing a
                <Link target='_blank' href='https://airtablecheckoutcart.gumroad.com/l/checkout-cart'>
                    &nbsp;premium license
                </Link> or
                <Link href='https://www.buymeacoffee.com/zakey' target='_blank'>
                    &nbsp;buying me a coffee
                </Link>!
            </Text>
        </Box>
        <br/>
        <Text fontWeight={600} size='xlarge'>Source Code:</Text>
        <br/>
        <Text paddingLeft='1rem'>
            This extension is open source and can be viewed on
            <Link target='_blank' href='https://github.com/Zakinator123/checkout-cart'>&nbsp;Github</Link>
            <br/>
            Version 0.0.2
        </Text>
    </Box>
}