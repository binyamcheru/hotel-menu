package utils

import "github.com/skip2/go-qrcode"

// GenerateQRCode generates a QR code PNG for a given URL

func GenerateQRCode(url string, size int) ([]byte, error) {
	return qrcode.Encode(url, qrcode.Medium, size)
}