package com.talentflow.backend.dto;

public class SystemInfoDTO {
    private String javaVersion;
    private String javaVendor;
    private String osName;
    private String osArch;
    private int availableProcessors;
    private long totalMemoryMb;
    private long freeMemoryMb;
    private long usedMemoryMb;
    private long maxMemoryMb;

    public SystemInfoDTO() {}

    public SystemInfoDTO(String javaVersion, String javaVendor, String osName, String osArch,
                         int availableProcessors, long totalMemoryMb, long freeMemoryMb,
                         long usedMemoryMb, long maxMemoryMb) {
        this.javaVersion = javaVersion;
        this.javaVendor = javaVendor;
        this.osName = osName;
        this.osArch = osArch;
        this.availableProcessors = availableProcessors;
        this.totalMemoryMb = totalMemoryMb;
        this.freeMemoryMb = freeMemoryMb;
        this.usedMemoryMb = usedMemoryMb;
        this.maxMemoryMb = maxMemoryMb;
    }

    public String getJavaVersion() { return javaVersion; }
    public void setJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }

    public String getJavaVendor() { return javaVendor; }
    public void setJavaVendor(String javaVendor) { this.javaVendor = javaVendor; }

    public String getOsName() { return osName; }
    public void setOsName(String osName) { this.osName = osName; }

    public String getOsArch() { return osArch; }
    public void setOsArch(String osArch) { this.osArch = osArch; }

    public int getAvailableProcessors() { return availableProcessors; }
    public void setAvailableProcessors(int availableProcessors) { this.availableProcessors = availableProcessors; }

    public long getTotalMemoryMb() { return totalMemoryMb; }
    public void setTotalMemoryMb(long totalMemoryMb) { this.totalMemoryMb = totalMemoryMb; }

    public long getFreeMemoryMb() { return freeMemoryMb; }
    public void setFreeMemoryMb(long freeMemoryMb) { this.freeMemoryMb = freeMemoryMb; }

    public long getUsedMemoryMb() { return usedMemoryMb; }
    public void setUsedMemoryMb(long usedMemoryMb) { this.usedMemoryMb = usedMemoryMb; }

    public long getMaxMemoryMb() { return maxMemoryMb; }
    public void setMaxMemoryMb(long maxMemoryMb) { this.maxMemoryMb = maxMemoryMb; }

    public static SystemInfoDTOBuilder builder() {
        return new SystemInfoDTOBuilder();
    }

    public static class SystemInfoDTOBuilder {
        private String javaVersion;
        private String javaVendor;
        private String osName;
        private String osArch;
        private int availableProcessors;
        private long totalMemoryMb;
        private long freeMemoryMb;
        private long usedMemoryMb;
        private long maxMemoryMb;

        public SystemInfoDTOBuilder javaVersion(String javaVersion) { this.javaVersion = javaVersion; return this; }
        public SystemInfoDTOBuilder javaVendor(String javaVendor) { this.javaVendor = javaVendor; return this; }
        public SystemInfoDTOBuilder osName(String osName) { this.osName = osName; return this; }
        public SystemInfoDTOBuilder osArch(String osArch) { this.osArch = osArch; return this; }
        public SystemInfoDTOBuilder availableProcessors(int availableProcessors) { this.availableProcessors = availableProcessors; return this; }
        public SystemInfoDTOBuilder totalMemoryMb(long totalMemoryMb) { this.totalMemoryMb = totalMemoryMb; return this; }
        public SystemInfoDTOBuilder freeMemoryMb(long freeMemoryMb) { this.freeMemoryMb = freeMemoryMb; return this; }
        public SystemInfoDTOBuilder usedMemoryMb(long usedMemoryMb) { this.usedMemoryMb = usedMemoryMb; return this; }
        public SystemInfoDTOBuilder maxMemoryMb(long maxMemoryMb) { this.maxMemoryMb = maxMemoryMb; return this; }

        public SystemInfoDTO build() {
            return new SystemInfoDTO(javaVersion, javaVendor, osName, osArch, availableProcessors, totalMemoryMb, freeMemoryMb, usedMemoryMb, maxMemoryMb);
        }
    }
}
