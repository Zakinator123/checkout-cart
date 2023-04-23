import React from "react";
import {Box, Link, loadCSSFromString, Text} from "@airtable/blocks/ui";
import {CollapsibleSectionHeader} from "./CollapsibleSectionHeader";
import Collapsible from "react-collapsible";

loadCSSFromString(`
.centered-about-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem;
    max-width: 750px;
    margin-top: 1rem;
}

.explanation-section {
    padding-left: 1rem;
}

@media (min-width: 515px) {
    .centered-about-container {
        padding: 3rem;
        margin-top: 0;
    }
    
    .explanation-section {
        padding-left: 2rem;
    }
}`);

export const About = () => {
    return <Box className='centered-about-container'>
        <Text as='h3' fontWeight={600} size='xlarge'>About:</Text>
        <Box padding='0.7rem'>
            <Text>
                Checkout Cart helps you manage library-style inventories where items are checked-out and checked-in by
                recipients.

                The cart interface facilitates quick bulk transactions, while automatically recording check-out,
                check-in, and due dates. The extension can also auto-generate and configure the required tables and
                fields for you.
                <br/>
                <br/>
                To get started, configure the extension in the settings tab, then start using the checkout cart!
            </Text>
        </Box>
        <br/>

        <Text as='h3' fontWeight={600} size='xlarge'>How this extension works:</Text>
        <br/>

        <Collapsible
            transitionTime={200}
            trigger={CollapsibleSectionHeader(false, 'Check-Outs:', '0')}
            triggerWhenOpen={CollapsibleSectionHeader(true, 'Check-Outs:', '0')}
        >
            <br/>
            <Box className='explanation-section'>
                When the transaction type is set to &quot;Check Out&quot;, items are added to the cart,
                a recipient is associated with the cart, and the &quot;Check Out Items&quot; button is pressed,
                this extension will:
                <ol>
                    <li>Find checkouts associated with items in the cart that are not &quot;checked
                        in&quot; (called &quot;Open Checkouts&quot;)
                        and mark them as checked in with the configured checkbox field. This prevents the item from
                        having multiple open checkouts simultaneously.
                        (E.g. A book cannot be checked out to two different people at the same time.)
                        <br/>
                        <br/>
                        <ul>
                            <li><strong>If the &quot;Delete Open Checkouts Upon Check-In&quot; setting is
                                enabled: </strong>
                                Instead of being marked as &quot;checked in&quot; the <strong>Open</strong> Checkouts
                                will be deleted entirely.
                                Existing checkouts associated with the item that are already marked as &quot;checked
                                in&quot; will not be deleted.
                            </li>
                        </ul>
                    </li>
                    <br/>
                    <li>For every item in the cart, create a new checkout record that is linked to that item and linked
                        to the recipient associated with the cart.
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
            transitionTime={200}
            trigger={CollapsibleSectionHeader(false, 'Check-Ins:', '0')}
            triggerWhenOpen={CollapsibleSectionHeader(true, 'Check-Ins:', '0')}
        >
            <br/>
            <Box className='explanation-section'>
                When the transaction type is set to &quot;Check In&quot;, items are added to the cart,
                and the &quot;Check In Items&quot; button is pressed, this extension will:
                <ol>
                    <li>Find checkouts associated with items in the cart that are not &quot;checked
                        in&quot; (called &quot;Open Checkouts&quot;)
                        and mark them as checked in with the configured checkbox field. (Same as step 1 above for
                        Check-Outs)
                        <br/>
                        <br/>
                        <ul>
                            <li><strong>If the &quot;Delete Open Checkouts Upon Check-In&quot; setting is
                                enabled: </strong>
                                Instead of being marked as &quot;checked in&quot; the <strong>Open</strong> Checkouts
                                will be deleted entirely.
                                Existing checkouts associated with the item that are already marked as &quot;checked
                                in&quot; will not be deleted.
                            </li>
                        </ul>
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
        <Box padding='0.7rem'>
            Any feedback, feature requests, bug reports, questions, and consultation/customization inquiries can be sent
            to the developer at&nbsp;
            <Link href='mailto:support@zoftware-solutions.com'>support@zoftware-solutions.com</Link>
            <br/>
            <br/>
            <Text>
                If you would like to support the development of this extension, please consider purchasing a
                <Link target='_blank' href='https://www.zoftware-solutions.com/l/checkoutcart'>
                    &nbsp;premium license
                </Link>.
            </Text>
        </Box>
        <br/>
        <Text fontWeight={600} size='xlarge'>Source Code:</Text>
        <Text padding='0.7rem'>
            This extension is open source and can be viewed on
            <Link target='_blank' href='https://github.com/Zakinator123/checkout-cart'>&nbsp;Github</Link>
            <br/>
            Version 1.0.0
        </Text>
    </Box>
}