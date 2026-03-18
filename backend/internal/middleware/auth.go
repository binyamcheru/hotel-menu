package middleware

import (
	"net/http"
	"strings"

	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.UnauthorizedResponse(c, "Authorization header required")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.UnauthorizedResponse(c, "Invalid authorization format")
			c.Abort()
			return
		}

		tokenString := parts[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			utils.UnauthorizedResponse(c, "Invalid or expired token")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			utils.UnauthorizedResponse(c, "Invalid token claims")
			c.Abort()
			return
		}

		// Reject refresh tokens — only access tokens are allowed for API auth
		if tokenType, _ := claims["type"].(string); tokenType == "refresh" {
			utils.UnauthorizedResponse(c, "Refresh tokens cannot be used for API access")
			c.Abort()
			return
		}

		c.Set("user_id", claims["user_id"])
		c.Set("hotel_id", claims["hotel_id"])
		c.Set("role", claims["role"])
		c.Next()
	}
}

func RoleMiddleware(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			utils.ForbiddenResponse(c, "Access denied")
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			utils.ForbiddenResponse(c, "Invalid role")
			c.Abort()
			return
		}

		for _, r := range roles {
			if r == roleStr {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		c.Abort()
	}
}
