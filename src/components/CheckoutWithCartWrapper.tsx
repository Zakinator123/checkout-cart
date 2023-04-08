import {ExtensionConfiguration, TablesAndFieldsConfigurationIds, ValidationResult} from "../types/ConfigurationTypes";
import React from "react";
import CheckoutCart from "./CheckoutCart";
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
                                     configurationValidator,
                                     isPremiumUser,
                                     transactionIsProcessing,
                                     setTransactionIsProcessing
                                 }:
                                     {
                                         extensionConfiguration: ExtensionConfiguration | undefined,
                                         configurationValidator: (configIds: TablesAndFieldsConfigurationIds) => ValidationResult,
                                         isPremiumUser: boolean,
                                         transactionIsProcessing: boolean,
                                         setTransactionIsProcessing: (processing: boolean) => void
                                     }) => {

    if (extensionConfiguration === undefined) {
        return <div className='centered-container'><Text size="large">You must configure the extension in the settings
            tab before you can use it!</Text></div>;
    }

    const validationResult = configurationValidator(extensionConfiguration.tableAndFieldIds);
    return validationResult.errorsPresent ?
        <div className='centered-container'><Text>
            Something has changed with your base schema and your extension configuration is now invalid. Please correct
            it in the
            settings page.</Text></div> :
        <CheckoutCart
            transactionService={new TransactionService(validationResult.configuration, extensionConfiguration.otherConfiguration.deleteOpenCheckoutsUponCheckIn)}
            tablesAndFields={validationResult.configuration}
            otherConfiguration={extensionConfiguration.otherConfiguration}
            isPremiumUser={isPremiumUser}
            transactionIsProcessing={transactionIsProcessing}
            setTransactionIsProcessing={setTransactionIsProcessing}
        />;
}

export default CheckoutWithCartWrapper;