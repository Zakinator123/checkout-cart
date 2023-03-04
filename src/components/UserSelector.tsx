import {Box, Button, Label, loadCSSFromString, RecordCard, Tooltip} from "@airtable/blocks/ui";
import React from "react";

loadCSSFromString(`
.user-selector {
    padding: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #e7ffe7;
    justify-content: center;
    margin-bottom: 2rem;
}

.user-search-button {
    color: blue;
    margin: 1rem;
}

.user-selector-container {
    width: 100%;
}`);

const UserSelector = props => <div className='user-selector-container'>
    <Label> User Associated with Cart: </Label>
    <Box className='user-selector' border='thick'>
        {props.currentTransactionUser === null
            ? <Box> No user is currently associated with the cart!</Box>
            : <Box>
                <RecordCard fields={props.fieldsToShow} width={props.viewportWidth - 130}
                            record={props.currentTransactionUser}/>
            </Box>}
        <Tooltip
            content="Search Users"
            placementX={Tooltip.placements.CENTER}
            placementY={Tooltip.placements.BOTTOM}
            shouldHideTooltipOnClick={true}
        >
            <Button
                className='user-search-button'
                aria-label="Search and select a user to associate with the transaction."
                icon='search'
                onClick={props.selectUser}
            />
        </Tooltip>
    </Box>
</div>;

export default UserSelector;