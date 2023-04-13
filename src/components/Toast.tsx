import {ToastContainer, Zoom} from "react-toastify";
import React from "react";
import {loadCSSFromString} from "@airtable/blocks/ui";


loadCSSFromString(`
:root {
  --toastify-toast-min-height: 55px; 
  --toastify-toast-max-height: 10000px;
}

.Toastify__toast-theme--colored.Toastify__toast--default {
    background: #f9f9f9,
    color: #565656
}

.Toastify {
    width: 100%;
    display: flex;
    justify-content: center;
}

.Toastify__toast-container {
    all: revert;
    margin-top: 1rem;
}

    .Toastify__toast {
        margin-bottom: 1rem;
        border-radius: 8px;
    }

@media only screen and (max-width: 480px) {
    .Toastify__toast-container {
        all: revert;
        margin-top: 1rem;
    }
    
    .Toastify__toast {
        margin-bottom: 1rem;
        border-radius: 8px;
    }
}
`)

export const Toast = (toastContainerId?: { containerId?: string }) => {
    const multiContainerProps = {
        enableMultiContainer: true,
        ...toastContainerId
    }
    return <ToastContainer
        theme="colored"
        {...(toastContainerId ? multiContainerProps : {})}
        transition={Zoom}
        style={{
            position: "relative",
            maxWidth: '450px',
            width: '70vw',
        }}
        autoClose={4000}
        position="top-center"
        closeButton={true}
    />;
};