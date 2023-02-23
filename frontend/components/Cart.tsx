import React from "react";
import {Box, Button, Label, loadCSSFromString, RecordCard, Text, Tooltip} from "@airtable/blocks/ui";

loadCSSFromString(`
.cart {
    border: thick;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: lightgray;
    padding: 1rem;
    height: 80%;
    min-width: 683px;
}

.cart-item {
    margin: 0.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: white;
}

.cart-item-record {
    width: 568px;
}

.cart-item-delete-button {
    margin: 1rem;
    color: red;
}
`);

function Cart(props) {
    return <div>
        <Label> Cart: </Label>
        <Box className="cart" display='flex' flexDirection='column' alignItems='center' alignContent='center'>
            {props.cartRecords.length === 0
                ? <Text className="cart-item-record">The cart is currently empty.</Text>
                : props.cartRecords.map(record =>
                    <Box border='default' className="cart-item" key={record.id}>
                        <RecordCard className="cart-item-record" record={record}/>
                        <Tooltip
                            content="Remove from Cart"
                            placementX={Tooltip.placements.CENTER}
                            placementY={Tooltip.placements.BOTTOM}
                            shouldHideTooltipOnClick={true}
                        >
                            <Button
                                onClick={() => props.removeRecordFromCart(record.id)}
                                size='small'
                                aria-label="Remove item from cart."
                                className='cart-item-delete-button' icon='trash'
                            >
                            </Button>
                        </Tooltip>
                    </Box>
                )
            }

            <Button
                onClick={props.addRecordToCart}
                icon="plus"
                margin={3}>
                Add to Cart
            </Button>
        </Box>

    </div>;
}

export default Cart;