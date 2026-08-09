import React from 'react';

const PROVIDERS = [
  ['mtn', 'MTN Mobile Money'],
  ['telecel', 'Telecel Cash'],
  ['airteltigo', 'AirtelTigo Money'],
];

const TrustBar = () => (
  <div className="trust-bar" aria-label="Supported networks">
    {PROVIDERS.map(([id, label], index) => (
      <React.Fragment key={id}>
        {index > 0 && <span className="separator" aria-hidden="true" />}
        <span className="trust-item"><i className={`trust-dot ${id}`} aria-hidden="true" />{label}</span>
      </React.Fragment>
    ))}
  </div>
);

export default TrustBar;
