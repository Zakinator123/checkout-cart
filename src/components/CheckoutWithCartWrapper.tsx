import {TablesAndFieldsConfigurationIds, ValidationResult} from "../types/ConfigurationTypes";
import React from "react";
import CheckoutWithCart from "./CheckoutWithCart";
import {TransactionService} from "../services/TransactionService";
import {loadCSSFromString, Text} from "@airtable/blocks/ui";

loadCSSFromString(`
.centered-container {
    display: flex;
    align-content: center;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 5rem;
}
`);

const CheckoutWithCartWrapper = ({
                                     extensionConfiguration,
                                     configurationValidator
                                 }: { extensionConfiguration: TablesAndFieldsConfigurationIds | undefined, configurationValidator: (configIds: TablesAndFieldsConfigurationIds) => ValidationResult }) => {

    if (extensionConfiguration === undefined) {
        return <div className='centered-container'><Text size="large">You must configure the extension in the settings tab before you can use it!</Text></div>;
    }

    const validationResult = configurationValidator(extensionConfiguration);
    return validationResult.errorsPresent ?
        <div className='centered-container'> <Text>
            Something has changed with your base schema and your extension configuration is now invalid. Please correct it in the
            settings page.</Text></div> :
        <CheckoutWithCart transactionService={new TransactionService(validationResult.configuration)}
                          config={validationResult.configuration}/>;
}

export default CheckoutWithCartWrapper;