/**
 * Printer configuration utilities
 * Handles IP address storage and retrieval for the EPSON printer
 */

const DEFAULT_IP = '192.168.1.102';
const STORAGE_KEY = 'printerIpAddress';

/**
 * Get the printer IP address from localStorage or return default
 */
export function getPrinterIpAddress(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return default
    return DEFAULT_IP;
  }
  
  try {
    const savedIp = localStorage.getItem(STORAGE_KEY);
    return savedIp || DEFAULT_IP;
  } catch (error) {
    console.warn('Failed to read printer IP from localStorage:', error);
    return DEFAULT_IP;
  }
}

/**
 * Set the printer IP address in localStorage
 */
export function setPrinterIpAddress(ipAddress: string): boolean {
  if (typeof window === 'undefined') {
    // Server-side rendering - cannot save
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, ipAddress);
    return true;
  } catch (error) {
    console.error('Failed to save printer IP to localStorage:', error);
    return false;
  }
}

/**
 * Get the full printer service URL
 */
export function getPrinterServiceUrl(timeout: number = 30000): string {
  const ip = getPrinterIpAddress();
  return `https://${ip}:8043/cgi-bin/epos/service.cgi?devid=local_printer&timeout=${timeout}`;
}

/**
 * Validate IP address format
 */
export function isValidIpAddress(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  if (!ipRegex.test(ip)) {
    return false;
  }
  
  const octets = ip.split('.');
  for (const octet of octets) {
    const num = parseInt(octet, 10);
    if (num < 0 || num > 255) {
      return false;
    }
  }
  
  return true;
}

/**
 * Hook for React components to get and update printer IP
 * Returns [ipAddress, setIpAddress, isLoading]
 */
export function usePrinterIp(): [string, (ip: string) => void, boolean] {
  const [ipAddress, setIpAddressState] = useState(DEFAULT_IP);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const savedIp = getPrinterIpAddress();
    setIpAddressState(savedIp);
    setIsLoading(false);
  }, []);
  
  const setIpAddress = useCallback((ip: string) => {
    if (isValidIpAddress(ip)) {
      setPrinterIpAddress(ip);
      setIpAddressState(ip);
    } else {
      throw new Error('Invalid IP address format');
    }
  }, []);
  
  return [ipAddress, setIpAddress, isLoading];
}

// Need to import React hooks for the custom hook
import { useState, useEffect, useCallback } from 'react';
