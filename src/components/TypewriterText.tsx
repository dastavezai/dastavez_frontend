import React, { useState, useEffect} from 'react';

const TypewriterText = ({words}: {words: string[]}) => {
    const [index, setIndex]=useState(0);
    const[subIndex, setSubIndex]=useState(0);
    const[isDeleting, setIsDeleting]=useState(false);

    useEffect(() => {
        if(subIndex=== words[index].length + 1 && !isDeleting){
            setTimeout(() => setIsDeleting(true), 2000);
        return;
    }

    if(subIndex===0 && isDeleting){
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
        return;
    }

    const timeout = setTimeout (() => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 70: 150);

    return () => clearTimeout(timeout);
}, [subIndex, isDeleting, index, words]);

  return (
    <span className="inline-block text-judicial-gold min-w-[280px] text-left">
        {words[index].substring(0, subIndex)}
    </span> 
     );
};

export default TypewriterText;
