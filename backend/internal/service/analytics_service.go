package service

import (
	"context"

	"backend/internal/domain"
	"backend/internal/repository"

	"github.com/google/uuid"
)

type AnalyticsService struct {
	hotelScanRepo repository.HotelScanRepository
	menuViewRepo  repository.MenuViewRepository
}

func NewAnalyticsService(
	hotelScanRepo repository.HotelScanRepository,
	menuViewRepo repository.MenuViewRepository,
) *AnalyticsService {
	return &AnalyticsService{
		hotelScanRepo: hotelScanRepo,
		menuViewRepo:  menuViewRepo,
	}
}

func (s *AnalyticsService) RecordHotelScan(ctx context.Context, hotelID uuid.UUID) error {
	scan := &domain.HotelScan{HotelID: hotelID}
	return s.hotelScanRepo.Create(ctx, scan)
}

func (s *AnalyticsService) RecordMenuView(ctx context.Context, hotelID, menuItemID uuid.UUID) error {
	view := &domain.MenuView{HotelID: hotelID, MenuItemID: menuItemID}
	return s.menuViewRepo.Create(ctx, view)
}

type AnalyticsSummary struct {
	TotalScans     int64 `json:"total_scans"`
	TotalMenuViews int64 `json:"total_menu_views"`
}

func (s *AnalyticsService) GetSummary(ctx context.Context, hotelID uuid.UUID) (*AnalyticsSummary, error) {
	scans, err := s.hotelScanRepo.CountByHotelID(ctx, hotelID)
	if err != nil {
		return nil, err
	}
	views, err := s.menuViewRepo.CountByHotelID(ctx, hotelID)
	if err != nil {
		return nil, err
	}
	return &AnalyticsSummary{
		TotalScans:     scans,
		TotalMenuViews: views,
	}, nil
}
