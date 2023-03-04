import {Button, Dialog, Heading, Text} from "@airtable/blocks/ui";
import React from "react";

export const ErrorDialog = ({clearErrorMessages, errors}: { errors: string[]; clearErrorMessages: (() => void); }) => <>
    {errors.length !== 0 && (
        <Dialog onClose={() => {
        }} width="320px">
            <Dialog.CloseButton onClick={clearErrorMessages}/>
            <Heading>Error!</Heading>
            <Text variant="paragraph">
                Error(s) occurred while attempting to execute the transaction:
            </Text>
            <ul>
                {errors.map((errorMessage, index) => <li key={index}>{errorMessage}</li>)}
            </ul>

            <Button onClick={clearErrorMessages}>Close</Button>
        </Dialog>
    )}
</>;