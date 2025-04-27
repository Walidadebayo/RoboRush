"use client"

import { useState, useEffect } from "react"

interface WindowWithOpera extends Window {
  opera?: unknown;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if the device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || ((window as WindowWithOpera).opera as string)

      // Check if device is mobile based on user agent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

      // Also check screen width for tablets and small screens
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth < 768

      setIsMobile(isMobileDevice)
    }

    checkMobile()

    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
