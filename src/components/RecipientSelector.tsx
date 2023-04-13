import {Record} from "@airtable/blocks/models";
import {Box, Button, Label, loadCSSFromString, RecordCard, Tooltip} from "@airtable/blocks/ui";
import React from "react";
import {getRecordCardWidth} from "../utils/RandomUtils";

loadCSSFromString(`
.recipient-selector {
    padding: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #2872e12b;
    justify-content: center;
    margin-bottom: 1rem;
}

.recipient-search-button {
    color: blue;
    margin: 1rem;
}

.recipient-selector-container {
    width: 100%;
    max-width: 1000px;
}`);

const RecipientSelector = ({
                               currentTransactionRecipient,
                               selectRecipient: selectRecipient,
                               viewportWidth,
                               transactionIsProcessing
                           }: { currentTransactionRecipient: Record | undefined; viewportWidth: number; selectRecipient: () => Promise<void>, transactionIsProcessing: boolean }) =>
    <Box className='recipient-selector-container'>
        <Label> Checkout Recipient: </Label>
        <Box className='recipient-selector' border='thick'>
            {currentTransactionRecipient === undefined
                ? <Box> No recipient is associated with the cart</Box>
                : <Box>
                    <RecordCard
                        width={getRecordCardWidth(viewportWidth)}
                        record={currentTransactionRecipient}/>
                </Box>}
            <Tooltip
                content="Select a Recipient"
                placementX={Tooltip.placements.CENTER}
                placementY={Tooltip.placements.BOTTOM}
                shouldHideTooltipOnClick={true}
            >
                <Button
                    className='recipient-search-button'
                    aria-label="Search and select a recipient to associate with the transaction."
                    icon='search'
                    disabled={transactionIsProcessing}
                    onClick={selectRecipient}
                    maxWidth='33px'
                />
            </Tooltip>
        </Box>
    </Box>;

export default RecipientSelector;