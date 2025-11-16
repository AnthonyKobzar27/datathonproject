'use client';

import { useMemo } from 'react';
import makeBlockie from 'ethereum-blockies-base64';

interface AvatarProps {
  hash?: string;
  size?: number;
}

export default function Avatar({ hash, size = 40 }: AvatarProps) {
  // Generate blockie data URL from hash
  const blockieSrc = useMemo(() => {
    if (!hash) return null;
    
    try {
      // Clean the hash - remove 0x prefix if present, use lowercase
      const cleanHash = hash.toLowerCase().replace(/^0x/, '');
      
      if (!cleanHash || cleanHash.length < 8) {
        return null;
      }

      // Generate blockie base64 image
      return makeBlockie(cleanHash);
    } catch (error) {
      console.error('Error generating blockie:', error);
      return null;
    }
  }, [hash]);

  return (
    <div
      className="rounded-full overflow-hidden border-2 border-gray-300 bg-white relative"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {blockieSrc ? (
        <img
          src={blockieSrc}
          alt="Profile"
          className="rounded-full"
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      ) : (
        <img
          src="/noprofile.png"
          alt="No profile"
          className="rounded-full"
          style={{ 
            width: '150%', 
            height: '150%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </div>
  );
}

