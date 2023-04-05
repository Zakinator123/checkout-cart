import React from "react";
import {Box, Button, Label, loadCSSFromString, RecordCard, Text, Tooltip} from "@airtable/blocks/ui";
import {RecordId} from "@airtable/blocks/types";
import {getRecordCardWidth} from "../utils/RandomUtils";

loadCSSFromString(`
.cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #e7ffe7;
    padding: 1rem;
    height: 80%;
}

.cart-item {
    margin: 0.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: white;
}

.cart-item-delete-button {
    margin: 1rem;
    color: red;
}

.cart-container {
    width: 100%;
    max-width: 1000px;
}`);

const Cart = ({
                  addRecordToCart,
                  cartRecords,
                  transactionIsProcessing,
                  removeRecordFromCart,
                  viewportWidth,
                  isPremiumUser,
              }:
                  {
                      addRecordToCart: () => Promise<void> | undefined;
                      cartRecords: any[],
                      transactionIsProcessing: boolean,
                      removeRecordFromCart: (recordId: RecordId) => void,
                      viewportWidth: number,
                      isPremiumUser: boolean
                  }) =>
    <div className='cart-container'>
        <Label> Cart: </Label>
        <Box className="cart" border="thick">
            {cartRecords.length === 0
                ? <Text className="cart-item-record">The cart is currently empty.</Text>
                : cartRecords.map(record =>
                    <Box border='default' className="cart-item" key={record.id}>
                        <RecordCard
                            width={getRecordCardWidth(viewportWidth)}
                            record={record}/>
                        <Tooltip
                            content="Remove from Cart"
                            placementX={Tooltip.placements.CENTER}
                            placementY={Tooltip.placements.BOTTOM}
                            shouldHideTooltipOnClick={true}
                        >
                            <Button
                                onClick={() => removeRecordFromCart(record.id)}
                                size='small'
                                disabled={transactionIsProcessing}
                                aria-label="Remove item from cart"
                                className='cart-item-delete-button' icon='trash'
                            >
                            </Button>
                        </Tooltip>
                    </Box>
                )
            }
            <Button
                onClick={addRecordToCart}
                disabled={transactionIsProcessing}
                icon="plus"
                margin={3}>
                Add to Cart
            </Button>
        </Box>
        {!isPremiumUser &&
            <Box margin={2}><Text size='small' textColor='gray'>Upgrade to premium to add more than 3 items to the
                cart!</Text></Box>}
    </div>;

export default Cart;