import React, { useState, useEffect } from 'react';
import * as ethers from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const CoffeeContext = React.createContext();



export const CoffeeProvider = ({ children }) => {
    const [contract, setContract] = useState(null);
    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const coffeeContract = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(coffeeContract);
        }
    }, []);
    return (
        <CoffeeContext.Provider value={contract}>
            {children}
        </CoffeeContext.Provider>
    )
}