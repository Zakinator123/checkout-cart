import {Button, Dialog, Heading, Text} from "@airtable/blocks/ui";
import React from "react";

export const ErrorDialog = props => <>
    {props.errors.length !== 0 && (
        <Dialog onClose={() => {
        }}
                width="320px">
            <Dialog.CloseButton onClick={props.clearErrorMessages}/>
            <Heading>Error!</Heading>
            <Text variant="paragraph">
                Error(s) occurred while attempting to execute the transaction:
            </Text>
            <ul>
                {props.errors.map((errorMessage, index) => <li key={index}>{errorMessage}</li>)}
            </ul>

            <Button onClick={props.clearErrorMessages}>Close</Button>
        </Dialog>
    )}
</>;