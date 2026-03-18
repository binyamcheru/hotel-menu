FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

# copy the rest of the project
COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app ./cmd/api

# build seed binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o seed ./cmd/seed/main.go

FROM gcr.io/distroless/base-debian12

WORKDIR /app

# copy binaries from builder
COPY --from=builder /app/app .
COPY --from=builder /app/seed .

# expose backend port
EXPOSE 8080

CMD ["./app"]