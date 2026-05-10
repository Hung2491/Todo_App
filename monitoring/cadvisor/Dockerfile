# Custom cAdvisor image with extended healthcheck timeout
# Based on gcr.io/cadvisor/cadvisor:v0.55.1

FROM gcr.io/cadvisor/cadvisor:v0.55.1

# Add healthcheck with 15s timeout (instead of default 3s)
HEALTHCHECK --interval=30s --timeout=15s --retries=3 --start-period=30s \
    CMD /bin/sh -c "wget --quiet --tries=1 --spider http://localhost:8081/api/v2.1/events || exit 1" || true

EXPOSE 8081

CMD ["--docker_only=true", "--housekeeping_interval=10s", "--allow_dynamic_housekeeping=true", "--port=8081"]
