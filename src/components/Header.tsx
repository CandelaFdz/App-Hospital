import React from 'react';
import logoApp from '../assets/icon.jpeg';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
            <div className="logo">
              <img src={logoApp} alt="Logo de la aplicación" />
            </div>
          </header>
  );
};